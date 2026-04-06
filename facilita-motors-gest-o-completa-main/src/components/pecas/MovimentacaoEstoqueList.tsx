import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatarDataCurta } from '@/lib/formatters';
import { ArrowDownRight, ArrowUpRight, PackageSearch } from 'lucide-react';
import type { EstoqueMovimentacao } from '@/types/database';

interface Props {
  movimentacoes: EstoqueMovimentacao[];
  loading: boolean;
}

export function MovimentacaoEstoqueList({ movimentacoes, loading }: Props) {
  if (loading) return <LoadingState variant="table" />;
  if (movimentacoes.length === 0) return <EmptyState icon={PackageSearch} titulo="Sem movimentações" descricao="Nenhuma movimentação registrada." />;

  return (
    <div className="space-y-2">
      {movimentacoes.map((m) => {
        const isEntrada = m.tipo === 'entrada';
        return (
          <div key={m.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {isEntrada
                ? <ArrowDownRight className="h-4 w-4 text-success shrink-0" />
                : <ArrowUpRight className="h-4 w-4 text-danger shrink-0" />
              }
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-[10px] ${isEntrada ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                    {isEntrada ? 'Entrada' : 'Saída'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatarDataCurta(m.criado_em!)}</span>
                </div>
                {m.motivo && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.motivo}</p>}
                {m.referencia_id && <p className="text-[10px] text-muted-foreground">Ref: {m.referencia_id.slice(0,8)}</p>}
              </div>
            </div>
            <span className={`font-mono text-sm font-medium shrink-0 ${isEntrada ? 'text-success' : 'text-danger'}`}>
              {isEntrada ? '+' : '-'}{m.quantidade}
            </span>
          </div>
        );
      })}
    </div>
  );
}
