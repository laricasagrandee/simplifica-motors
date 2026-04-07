import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/components/layout/AuthProvider';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Acao } from '@/lib/permissions';

interface ProtectedRouteProps {
  permissao: Acao;
  children: ReactNode;
}

export function ProtectedRoute({ permissao, children }: ProtectedRouteProps) {
  const { temPermissao, funcionarioLoading, funcionario } = useAuthContext();

  if (funcionarioLoading) return <>{children}</>;

  // Sem funcionario = AppLayout mostra AguardandoAprovacaoPage
  if (!funcionario) return <>{children}</>;

  if (!temPermissao(permissao)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="rounded-full bg-danger-light p-4 mb-4">
        <ShieldAlert className="h-8 w-8 text-danger" strokeWidth={1.75} />
      </div>
      <h1 className="font-display font-bold text-xl text-foreground mb-2">Acesso Restrito</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Você não tem permissão para acessar esta página. Fale com o administrador se acredita que isso é um erro.
      </p>
      <Button variant="outline" onClick={() => navigate('/dashboard')}>
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
