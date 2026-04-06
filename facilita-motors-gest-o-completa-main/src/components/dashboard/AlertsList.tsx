import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Alerta } from '@/hooks/useDashboardAlertas';

const ICON_MAP = {
  estoque: { icon: AlertTriangle, color: 'text-warning' },
  os_atrasada: { icon: Clock, color: 'text-danger' },
  pagamento: { icon: AlertTriangle, color: 'text-warning' },
};

interface AlertsListProps {
  data: Alerta[];
  loading: boolean;
}

export function AlertsList({ data, loading }: AlertsListProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-display font-semibold text-sm text-foreground mb-4">Alertas</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center gap-3 py-8 justify-center text-success">
          <CheckCircle className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-sm font-medium">Tudo em dia!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((a, i) => {
            const config = ICON_MAP[a.tipo];
            return (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <config.icon className={`h-4 w-4 mt-0.5 ${config.color} shrink-0`} strokeWidth={1.75} />
                <p className="text-sm text-foreground">{a.mensagem}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
