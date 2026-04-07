import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginHeroPanel } from '@/components/auth/LoginHeroPanel';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function LoginPage() {
  const { data: session, isLoading } = useQuery({
    queryKey: ['login-session-check'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (isLoading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      <div
        className="hidden lg:flex lg:w-[55%] flex-col items-center justify-center relative p-12"
        style={{ background: 'linear-gradient(135deg, hsl(220, 16%, 96%), hsl(160, 40%, 94%))' }}
      >
        <LoginHeroPanel />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <LoginFormCard />
      </div>
    </div>
  );
}

function LoginFormCard() {
  const { login, loading, error: loginError, lockedUntil } = useLogin();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('erro') === 'sem-acesso') {
      setUrlError('Esta conta não está vinculada a nenhuma oficina ativa. Entre em contato com o suporte.');
      searchParams.delete('erro');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const error = urlError || loginError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    try { await login({ email, senha }); } catch { /* handled */ }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-baseline justify-center gap-0.5 mb-8 lg:hidden">
        <span className="font-display font-extrabold text-2xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-2xl text-primary">Motors</span>
      </div>
      <div className="bg-card rounded-2xl shadow-lg p-8 lg:p-10 border border-border">
        <h2 className="font-display text-xl font-bold text-foreground">Bem-vindo de volta</h2>
        <p className="text-sm text-muted-foreground mb-8">Entre para acessar sua oficina</p>
        <LoginForm
          email={email}
          senha={senha}
          onEmailChange={setEmail}
          onSenhaChange={setSenha}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          lockedUntil={lockedUntil}
        />
      </div>
    </div>
  );
}
