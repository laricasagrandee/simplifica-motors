import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthContext } from '@/components/layout/AuthProvider';
import { Clock } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function AguardandoAprovacaoPage() {
  const { usuario } = useAuthContext();
  const { logout } = useLogout();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-full bg-warning-light p-4 mb-4">
        <Clock className="h-8 w-8 text-warning" strokeWidth={1.75} />
      </div>
      <h1 className="font-display font-bold text-xl text-foreground mb-2">Aguardando aprovação</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-1">
        Sua conta (<span className="font-mono text-xs">{usuario?.email}</span>) foi criada, mas um administrador precisa cadastrar seu perfil de funcionário para liberar o acesso.
      </p>
      <p className="text-xs text-muted-foreground mb-6">Entre em contato com o administrador da oficina.</p>
      <Button variant="outline" onClick={() => logout()}>Sair</Button>
    </div>
  );
}
