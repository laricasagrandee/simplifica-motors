import { useState, useCallback, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, Clock, Wallet, Cake, ShieldCheck, MessageSquare, CarFront, Timer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAlertasDashboard, type Alerta } from '@/hooks/useDashboardAlertas';
import { cn } from '@/lib/utils';

const DISMISSED_ALERTS_KEY = 'dismissed-dashboard-alertas';
const DISMISSED_ALERTS_EVENT = 'dismissed-dashboard-alertas-changed';

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

function getAlertKey(alerta: Alerta) {
  return alerta.id;
}

function readDismissedAlerts() {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const raw = window.localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveDismissedAlerts(keys: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(keys)));
  window.dispatchEvent(new CustomEvent(DISMISSED_ALERTS_EVENT));
}

export function NotificacoesBadge() {
  const { data: alertas = [] } = useAlertasDashboard();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedAlerts());

  useEffect(() => {
    if (alertas.length === 0) return;
    const currentKeys = new Set(alertas.map(getAlertKey));

    setDismissed((prev) => {
      const next = new Set(Array.from(prev).filter((key) => currentKeys.has(key)));
      saveDismissedAlerts(next);
      return next;
    });
  }, [alertas]);

  useEffect(() => {
    const syncDismissedAlerts = () => setDismissed(readDismissedAlerts());
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === DISMISSED_ALERTS_KEY) syncDismissedAlerts();
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(DISMISSED_ALERTS_EVENT, syncDismissedAlerts);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(DISMISSED_ALERTS_EVENT, syncDismissedAlerts);
    };
  }, []);

  const visibleAlertas = useMemo(
    () => alertas.filter((alerta) => !dismissed.has(getAlertKey(alerta))),
    [alertas, dismissed],
  );
  const count = visibleAlertas.length;

  const handleDismissAll = useCallback(() => {
    const keys = new Set(alertas.map(getAlertKey));
    setDismissed(keys);
    saveDismissedAlerts(keys);
    setOpen(false);
  }, [alertas]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen && alertas.length > 0) {
      const keys = new Set(alertas.map(getAlertKey));
      setDismissed(keys);
      saveDismissedAlerts(keys);
    }

    setOpen(nextOpen);
  }, [alertas]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Abrir notificações">
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
              const key = getAlertKey(alerta);
              const Icon = iconMap[alerta.tipo];

              return (
                <div key={key} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colorMap[alerta.tipo])} />
                  <p className="text-xs leading-snug flex-1">{alerta.mensagem}</p>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}