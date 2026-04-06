import { Badge } from '@/components/ui/badge';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  valorPecas: number;
  valorMaoObra: number;
  desconto: number;
  valorTotal: number;
  formaPagamento?: string | null;
  parcelas?: number | null;
  status: string;
  garantiaDias?: number | null;
  garantiaAte?: string | null;
}

export function OSResumoFinanceiro({ valorPecas, valorMaoObra, desconto, valorTotal, formaPagamento, parcelas, status, garantiaDias, garantiaAte }: Props) {
  const pago = status === 'entregue' && !!formaPagamento;
  const aguardando = status === 'concluida' && !formaPagamento;

  return (
    <div className="bg-secondary/50 border rounded-lg p-3 mb-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">Peças: <strong className="text-foreground">{formatarMoeda(valorPecas)}</strong></span>
        <span className="text-muted-foreground">Mão de Obra: <strong className="text-foreground">{formatarMoeda(valorMaoObra)}</strong></span>
        {desconto > 0 && <span className="text-muted-foreground">Desconto: <strong className="text-destructive">-{formatarMoeda(desconto)}</strong></span>}
        <span className="text-muted-foreground font-semibold">TOTAL: <strong className="text-foreground text-base">{formatarMoeda(valorTotal)}</strong></span>

        <div className="flex items-center gap-2 ml-auto">
          {pago && (
            <Badge variant="default" className="bg-emerald-600 text-white">
              Pago via {formaPagamento}{parcelas && parcelas > 1 ? ` em ${parcelas}x` : ''}
            </Badge>
          )}
          {aguardando && <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">Aguardando pagamento</Badge>}
          {garantiaAte && (
            <span className="text-xs text-muted-foreground">
              Garantia: {garantiaDias ?? '—'} dias (até {new Date(garantiaAte + 'T00:00:00').toLocaleDateString('pt-BR')})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
