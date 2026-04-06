import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail } from '@/lib/sanitize';
import type { User } from '@supabase/supabase-js';
import type { Funcionario } from '@/types/database';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_S = 60;

export function useAuthState() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUsuario(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const { data: funcionario, isLoading: funcionarioLoading } = useUsuarioAtual(usuario?.id);

  return {
    usuario,
    funcionario: funcionario ?? null,
    loading,
    funcionarioLoading,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const attemptsRef = useRef(0);

  const getRemainingLockSeconds = useCallback((): number => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  }, [lockedUntil]);

  const login = async ({ email, senha }: { email: string; senha: string }) => {
    setError(null);
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = getRemainingLockSeconds();
      throw new Error(`Muitas tentativas. Aguarde ${remaining}s.`);
    }

    setLoading(true);
    try {
      const cleanEmail = sanitizeEmail(email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: senha,
      });
      if (authError) throw authError;
      attemptsRef.current = 0;
      setLockedUntil(null);
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      queryClient.invalidateQueries({ queryKey: ['login-session-check'] });
      navigate('/dashboard', { replace: true });
      return data;
    } catch (err) {
      const authErr = err as Error;
      if (!authErr.message.startsWith('Muitas tentativas')) {
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION_S * 1000);
          attemptsRef.current = 0;
          setError(`Muitas tentativas. Aguarde ${LOCKOUT_DURATION_S}s.`);
          throw new Error('Rate limited');
        }
      }
      setError(authErr.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : authErr.message);
      throw authErr;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    lockedUntil,
    getRemainingLockSeconds,
  };
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      queryClient.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}

export function useUsuarioAtual(userId: string | undefined) {
  return useQuery<Funcionario | null>({
    queryKey: ['funcionario-atual', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as Funcionario | null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRecuperarSenha() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const recuperar = async (email: string) => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(sanitizeEmail(email), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { recuperar, loading, error, success };
}
