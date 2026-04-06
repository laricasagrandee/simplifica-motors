import { ShieldAlert } from 'lucide-react';

export function BloqueioScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-baseline gap-0.5 mb-6">
        <span className="font-display font-extrabold text-3xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-3xl text-primary">Motors</span>
      </div>
      <div className="rounded-full bg-danger-light p-6 mb-6">
        <ShieldAlert className="h-12 w-12 text-danger" strokeWidth={1.5} />
      </div>
      <h1 className="font-display font-bold text-2xl mb-2">Sua assinatura expirou</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Entre em contato para renovar seu plano e voltar a ter acesso completo ao sistema.
      </p>
      <div className="bg-muted rounded-lg p-4 max-w-sm mb-6">
        <p className="text-sm font-medium mb-1">WhatsApp de Suporte</p>
        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-accent font-mono font-bold text-lg">
          (11) 99999-9999
        </a>
      </div>
      <div className="bg-surface-secondary rounded-lg p-4 max-w-sm text-left">
        <p className="text-sm font-semibold mb-2">O que você ainda pode fazer:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>✓ Visualizar clientes, OS e financeiro</li>
          <li>✗ Criar ou editar qualquer registro</li>
          <li>✗ Abrir novas OS ou vendas</li>
        </ul>
      </div>
    </div>
  );
}
