import { useAuthContext } from '@/components/layout/AuthProvider';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle } from 'lucide-react';
import { SUPORTE_WHATSAPP, SUPORTE_NOME } from '@/lib/constants';

export default function AguardandoAprovacaoPage() {
  const { usuario } = useAuthContext();
  const { logout } = useLogout();

  const email = usuario?.email || '';
  const whatsappMsg = encodeURIComponent(`Olá, preciso que minha conta ${email} seja ativada no Facilita Motors.`);
  const whatsappUrl = `https://wa.me/${SUPORTE_WHATSAPP}?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <Clock className="h-8 w-8 text-destructive" strokeWidth={1.75} />
      </div>
      <h1 className="font-display font-bold text-xl text-foreground mb-2">Acesso não disponível</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-1">
        Sua conta (<span className="font-mono text-xs">{email}</span>) não está vinculada a nenhuma oficina ativa. Se você acredita que isso é um erro, entre em contato com o suporte.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        {SUPORTE_NOME} — Suporte
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            Falar com Suporte
          </a>
        </Button>
        <Button variant="outline" onClick={() => logout()}>Voltar ao Login</Button>
      </div>
    </div>
  );
}
