import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { CATEGORIAS_LABELS } from './financeiroConstants';
import { formatarDataCurta } from '@/lib/formatters';
import { ArrowDownLeft, AlertTriangle, Filter } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Movimentacao } from '@/types/database';

interface Props {
  contas: Movimentacao[];
  loading: boolean;
  onMarcarPago: (id: string) => void;
}

export function ContasReceberList({ contas, loading, onMarcarPago }: Props) {
  const [filtro, setFiltro] = useState<'todas' | 'os' | 'outras'>('todas');

  if (loading) return <LoadingState />;
  if (!contas.length) return <EmptyState icon={ArrowDownLeft} titulo="Nenhuma conta a receber" descricao="Todas as contas foram recebidas." />;

  const filtered = filtro === 'todas' ? contas
    : filtro === 'os' ? contas.filter(c => c.categoria === 'os_parcela')
    : contas.filter(c => c.categoria !== 'os_parcela');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {(['todas', 'os', 'outras'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors cursor-pointer',
              filtro === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted')}>
            <Filter className="h-3 w-3 inline mr-1" />
            {f === 'todas' ? 'Todas' : f === 'os' ? 'Parcelas de OS' : 'Outras'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(c => {
          const vencido = c.data_vencimento && new Date(c.data_vencimento) < new Date();
          const diasAtraso = c.data_vencimento ? differenceInDays(new Date(), new Date(c.data_vencimento)) : 0;
          const parcInfo = (c as any).parcela_numero && (c as any).total_parcelas
            ? `${(c as any).parcela_numero}/${(c as any).total_parcelas}` : null;

          return (
            <div key={c.id} className={`rounded-lg border p-3 ${vencido ? 'border-destructive/30 bg-danger-light/20' : 'bg-card'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.descricao}</p>
                  <div className="flex gap-2 items-center mt-0.5">
                    <p className="text-xs text-muted-foreground">{CATEGORIAS_LABELS[c.categoria] ?? c.categoria}</p>
                    {parcInfo && <Badge variant="outline" className="text-[10px]">Parcela {parcInfo}</Badge>}
                  </div>
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
                <MoneyDisplay valor={c.valor} className="text-success font-bold" />
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2 min-h-[44px]" onClick={() => onMarcarPago(c.id)}>
                Marcar como Recebido
              </Button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta neste filtro.</p>
        )}
      </div>
    </div>
  );
}
