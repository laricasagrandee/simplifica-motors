import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import type { StatusOS } from '@/types/database';
import type { OSRecente } from '@/hooks/useDashboardOS';

interface RecentOSProps {
  data: OSRecente[];
  loading: boolean;
}

const STATUS_BORDER_COLOR: Record<string, string> = {
  aberta: 'border-l-blue-400',
  em_orcamento: 'border-l-amber-400',
  aprovada: 'border-l-orange-400',
  em_execucao: 'border-l-violet-500',
  concluida: 'border-l-emerald-500',
  entregue: 'border-l-gray-300',
  cancelada: 'border-l-red-400',
};

export function RecentOS({ data, loading }: RecentOSProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-display font-semibold text-sm text-foreground">Últimas OS</h3>
        <button onClick={() => navigate('/os')} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          Ver todas <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {loading ? (
        <div className="px-5 pb-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 px-5">Nenhuma OS registrada</p>
      ) : (
        <div className="divide-y divide-border">
          {data.map((os) => {
            const veiculoLabel = [os.moto_modelo].filter(Boolean).join(' ') || 'Veículo';
            const borderColor = STATUS_BORDER_COLOR[os.status] ?? 'border-l-gray-300';
            return (
              <button
                key={os.id}
                onClick={() => navigate(`/os/${os.id}`)}
                className={`w-full flex items-center justify-between py-3.5 px-5 hover:bg-muted/40 transition-colors text-left border-l-[3px] ${borderColor}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">OS-{os.numero}</span>
                    <StatusBadge status={os.status as StatusOS} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate mt-0.5">{os.cliente_nome}</p>
                  <p className="text-xs text-muted-foreground">{veiculoLabel}{os.moto_placa ? ` · ${os.moto_placa}` : ''}</p>
                </div>
                {os.valor_total > 0 && <MoneyDisplay valor={os.valor_total} className="text-sm font-semibold text-foreground shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
