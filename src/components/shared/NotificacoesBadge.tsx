import { useState, useCallback } from 'react';
import { Bell, AlertTriangle, Clock, Wallet, Cake, ShieldCheck, MessageSquare, CarFront, Timer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAlertasDashboard, type Alerta } from '@/hooks/useDashboardAlertas';
import { cn } from '@/lib/utils';

const iconMap: Record<Alerta['tipo'], typeof AlertTriangle> = {
  estoque: AlertTriangle,
  os_atrasada: Clock,
  pagamento: Wallet,
  aniversario: Cake,
  garantia: ShieldCheck,
  orcamento_pendente: MessageSquare,
  aguardando_retirada: CarFront,
  execucao_longa: Timer,
};

const colorMap: Record<Alerta['tipo'], string> = {
  estoque: 'text-warning',
  os_atrasada: 'text-info',
  pagamento: 'text-destructive',
  aniversario: 'text-primary',
  garantia: 'text-warning',
  orcamento_pendente: 'text-warning',
  aguardando_retirada: 'text-info',
  execucao_longa: 'text-destructive',
};

export function NotificacoesBadge() {
  const { data: alertas = [] } = useAlertasDashboard();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlertas = alertas.filter((a, i) => !dismissed.has(`${a.tipo}-${i}`));
  const count = visibleAlertas.length;

  const handleDismiss = useCallback((key: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const handleDismissAll = useCallback(() => {
    const keys = alertas.map((a, i) => `${a.tipo}-${i}`);
    setDismissed(new Set(keys));
    setOpen(false);
  }, [alertas]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold">Notificações ({count})</p>
          {count > 0 && (
            <button onClick={handleDismissAll} className="text-[11px] text-primary hover:underline">
              Limpar tudo
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {count === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum alerta no momento</p>
          ) : (
            visibleAlertas.map((alerta) => {
              const origIndex = alertas.indexOf(alerta);
              const key = `${alerta.tipo}-${origIndex}`;
              const Icon = iconMap[alerta.tipo];
              return (
                <div key={key} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors group">
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colorMap[alerta.tipo])} />
                  <p className="text-xs leading-snug flex-1">{alerta.mensagem}</p>
                  <button
                    onClick={() => handleDismiss(key)}
                    className="text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
