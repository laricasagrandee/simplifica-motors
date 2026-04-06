import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import type { StatusOS } from '@/types/database';
import type { OSRecente } from '@/hooks/useDashboardOS';

interface RecentOSProps {
  data: OSRecente[];
  loading: boolean;
}

export function RecentOS({ data, loading }: RecentOSProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-display font-semibold text-sm text-foreground mb-4">Últimas OS</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma OS registrada</p>
      ) : (
        <div className="space-y-1">
          {data.map((os) => (
            <button
              key={os.id}
              onClick={() => navigate(`/os/${os.id}`)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">OS-{os.numero}</span>
                  <StatusBadge status={os.status as StatusOS} />
                </div>
                <p className="text-sm font-medium text-foreground truncate mt-0.5">{os.cliente_nome}</p>
                <p className="text-xs text-muted-foreground">{os.moto_modelo}{os.moto_placa ? ` · ${os.moto_placa}` : ''}</p>
              </div>
              {os.valor_total > 0 && <MoneyDisplay valor={os.valor_total} className="text-sm text-foreground shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
