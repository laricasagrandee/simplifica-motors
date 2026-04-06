import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { FORMAS_PAGAMENTO } from '@/lib/constants';
import { ICONES_PAGAMENTO } from '@/lib/pagamentoIcons';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Progress } from '@/components/ui/progress';
import type { OSPagamento, FormaPagamento } from '@/types/database';

interface Props {
  pagamentos: OSPagamento[];
  valorTotal: number;
  onRemover: (id: string) => void;
  loading: boolean;
}

export function PagamentosLista({ pagamentos, valorTotal, onRemover, loading }: Props) {
  const totalPago = pagamentos.reduce((s, p) => s + Number(p.valor), 0);
  const restante = Math.max(0, Math.round((valorTotal - totalPago) * 100) / 100);
  const percent = valorTotal > 0 ? Math.min((totalPago / valorTotal) * 100, 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-foreground">Pagamentos adicionados</p>
        <span className="text-xs text-muted-foreground">{pagamentos.length} entrada(s)</span>
      </div>

      <Progress value={percent} className="h-2" />

      <div className="space-y-2">
        {pagamentos.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 animate-scale-in">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-primary shrink-0">
                {(() => { const Icon = ICONES_PAGAMENTO[p.forma_pagamento as FormaPagamento]; return Icon ? <Icon className="h-4 w-4" /> : null; })()}
              </span>
              <span className="text-sm font-medium text-foreground truncate">
                {FORMAS_PAGAMENTO[p.forma_pagamento as FormaPagamento] || p.forma_pagamento}
                {(p.parcelas ?? 1) > 1 && <span className="text-muted-foreground ml-1">{p.parcelas}x</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <MoneyDisplay valor={p.valor} className="text-sm font-bold" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => onRemover(p.id)} disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total pago</span>
          <MoneyDisplay valor={totalPago} className="font-bold text-success" />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Restante</span>
          <MoneyDisplay valor={restante} className={`font-bold ${restante > 0 ? 'text-destructive' : 'text-success'}`} />
        </div>
      </div>
    </div>
  );
}
