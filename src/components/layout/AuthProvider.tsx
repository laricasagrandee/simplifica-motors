import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUsuarioAtual } from '@/hooks/useAuth';
import { temPermissao, type Acao } from '@/lib/permissions';
import { MASTER_EMAIL } from '@/lib/constants';
import { BloqueioProvider } from './BloqueioProvider';
import type { User } from '@supabase/supabase-js';
import type { Funcionario, CargoFuncionario } from '@/types/database';

interface AuthContextType {
  usuario: User | null;
  funcionario: Funcionario | null;
  loading: boolean;
  funcionarioLoading: boolean;
  cargo: CargoFuncionario | undefined;
  tenantId: string | null;
  temPermissao: (acao: Acao) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  funcionario: null,
  loading: true,
  funcionarioLoading: true,
  cargo: undefined,
  tenantId: null,
  temPermissao: () => false,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUsuario(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
        return;
      }

      // Master email: redirecionar para /admin em qualquer evento (SIGNED_IN ou INITIAL_SESSION)
      if (session?.user.email === MASTER_EMAIL) {
        navigate('/admin', { replace: true });
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        const current = window.location.pathname;
        const lastRoute = localStorage.getItem('fm:last-route');
        const target = lastRoute && !['/', '/login', '/recuperar-senha', '/admin'].includes(lastRoute)
          ? lastRoute
          : '/dashboard';

        if (current === '/login' || current === '/recuperar-senha' || current === '/') {
          navigate(target, { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !usuario) {
      navigate('/login', { replace: true });
    }
  }, [loading, usuario, navigate]);

  const { data: funcionario, isLoading: funcionarioLoading } = useUsuarioAtual(usuario?.id);

  const cargo = funcionario?.cargo as CargoFuncionario | undefined;
  const tenantId = (funcionario as Record<string, unknown> | null)?.tenant_id as string | null ?? null;

  const checkPermissao = useCallback(
    (acao: Acao) => temPermissao(cargo, acao),
    [cargo],
  );

  if (loading) return <AuthLoadingScreen />;
  if (!usuario) return null;

  // Master email nunca deve renderizar o sistema da oficina
  if (usuario.email === MASTER_EMAIL) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      funcionario: funcionario ?? null,
      loading,
      funcionarioLoading,
      cargo,
      tenantId,
      temPermissao: checkPermissao,
    }}>
      <BloqueioProvider>
        {children}
      </BloqueioProvider>
    </AuthContext.Provider>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="flex items-baseline gap-0.5">
        <span className="font-display font-extrabold text-3xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-3xl text-primary">Motors</span>
      </div>
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
