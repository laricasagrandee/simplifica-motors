import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatarDataCurta } from '@/lib/formatters';
import { CATEGORIAS_LABELS } from './financeiroConstants';
import { Check, Clock, Receipt } from 'lucide-react';
import type { Movimentacao } from '@/types/database';

interface Props {
  movimentacoes: Movimentacao[];
  loading: boolean;
  onMarcarPago: (id: string) => void;
}

export function MovimentacaoList({ movimentacoes, loading, onMarcarPago }: Props) {
  if (loading) return <LoadingState />;
  if (!movimentacoes.length) return <EmptyState icon={Receipt} titulo="Nenhuma movimentação" descricao="Nenhuma movimentação encontrada no período." />;

  return (
    <div className="space-y-2">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">Data</th><th className="p-2">Tipo</th><th className="p-2">Categoria</th>
            <th className="p-2">Descrição</th><th className="p-2 text-right">Valor</th>
            <th className="p-2">Status</th><th className="p-2"></th>
          </tr></thead>
          <tbody>
            {movimentacoes.map(m => (
              <tr key={m.id} className={`border-b hover:bg-muted/50 ${!m.pago ? 'bg-warning-light/30' : ''}`}>
                <td className="p-2 font-mono text-xs">{formatarDataCurta(m.data)}</td>
                <td className="p-2"><TipoBadge tipo={m.tipo} /></td>
                <td className="p-2 text-xs">{CATEGORIAS_LABELS[m.categoria] ?? m.categoria}</td>
                <td className="p-2 text-xs max-w-[200px] truncate">{m.descricao}</td>
                <td className="p-2 text-right">
                  <MoneyDisplay valor={m.valor} className={m.tipo === 'entrada' ? 'text-success' : 'text-destructive'} />
                </td>
                <td className="p-2"><PagoBadge pago={m.pago} /></td>
                <td className="p-2">
                  {!m.pago && <Button size="sm" variant="ghost" onClick={() => onMarcarPago(m.id)} className="text-xs">Pagar</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {movimentacoes.map(m => (
          <div key={m.id} className={`rounded-lg border p-3 ${!m.pago ? 'bg-warning-light/30' : 'bg-card'}`}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex gap-2 items-center">
                <TipoBadge tipo={m.tipo} />
                <span className="text-xs text-muted-foreground">{CATEGORIAS_LABELS[m.categoria] ?? m.categoria}</span>
              </div>
              <PagoBadge pago={m.pago} />
            </div>
            <p className="text-sm truncate">{m.descricao}</p>
            <div className="flex justify-between items-center mt-2">
              <MoneyDisplay valor={m.valor} className={m.tipo === 'entrada' ? 'text-success' : 'text-destructive'} />
              <span className="text-xs text-muted-foreground font-mono">{formatarDataCurta(m.data)}</span>
            </div>
            {!m.pago && (
              <Button size="sm" variant="outline" className="w-full mt-2 min-h-[44px]" onClick={() => onMarcarPago(m.id)}>
                Marcar como Pago
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  return tipo === 'entrada'
    ? <Badge className="bg-success-light text-success border-success-border text-xs">Entrada</Badge>
    : <Badge className="bg-danger-light text-danger border-danger-border text-xs">Saída</Badge>;
}

function PagoBadge({ pago }: { pago: boolean }) {
  return pago
    ? <Badge variant="outline" className="text-success text-xs gap-1"><Check className="h-3 w-3" />Pago</Badge>
    : <Badge variant="outline" className="text-warning text-xs gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
}
