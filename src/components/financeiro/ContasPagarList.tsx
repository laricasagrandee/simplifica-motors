import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { CATEGORIAS_LABELS } from './financeiroConstants';
import { formatarDataCurta } from '@/lib/formatters';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { Movimentacao } from '@/types/database';

interface Props {
  contas: Movimentacao[];
  loading: boolean;
  onMarcarPago: (id: string) => void;
}

export function ContasPagarList({ contas, loading, onMarcarPago }: Props) {
  if (loading) return <LoadingState />;
  if (!contas.length) return <EmptyState icon={ArrowUpRight} titulo="Nenhuma conta a pagar" descricao="Todas as contas foram pagas." />;

  return (
    <div className="space-y-2">
      {contas.map(c => {
        const vencido = c.data_vencimento && new Date(c.data_vencimento) < new Date();
        const diasAtraso = c.data_vencimento ? differenceInDays(new Date(), new Date(c.data_vencimento)) : 0;
        return (
          <div key={c.id} className={`rounded-lg border p-3 ${vencido ? 'border-destructive/30 bg-danger-light/20' : 'bg-card'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.descricao}</p>
                <p className="text-xs text-muted-foreground">{CATEGORIAS_LABELS[c.categoria] ?? c.categoria}</p>
                {c.data_vencimento && (
                  <p className="text-xs mt-1">
                    Vencimento: <span className="font-mono">{formatarDataCurta(c.data_vencimento)}</span>
                    {vencido && diasAtraso > 0 && (
                      <Badge variant="outline" className="ml-2 text-destructive text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" /> Vencido há {diasAtraso} dias
                      </Badge>
                    )}
                  </p>
                )}
              </div>
              <MoneyDisplay valor={c.valor} className="text-destructive font-bold" />
            </div>
            <Button size="sm" variant="outline" className="w-full mt-2 min-h-[44px]" onClick={() => onMarcarPago(c.id)}>
              Marcar como Pago
            </Button>
          </div>
        );
      })}
    </div>
  );
}
