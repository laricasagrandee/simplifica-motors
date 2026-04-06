import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  valorTotal: number;
  totalPago: number;
  onFinalizar: () => void;
  loading: boolean;
}

export function BotaoFinalizarPagamento({ valorTotal, totalPago, onFinalizar, loading }: Props) {
  const falta = Math.round((valorTotal - totalPago) * 100) / 100;
  const completo = falta <= 0.01;
  const troco = Math.max(0, Math.round((totalPago - valorTotal) * 100) / 100);

  if (!completo) {
    return (
      <Button disabled className="w-full h-14 text-base rounded-xl gap-2 opacity-70">
        <AlertCircle className="h-5 w-5" />
        Falta {formatarMoeda(falta)}
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={onFinalizar} disabled={loading}
        className="w-full h-14 text-base sm:text-lg font-bold bg-success hover:bg-success/90 text-success-foreground rounded-xl gap-2 animate-scale-in"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        Confirmar Pagamento · {formatarMoeda(valorTotal)}
      </Button>
      {troco > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          💵 Troco: <span className="font-semibold text-foreground">{formatarMoeda(troco)}</span>
        </p>
      )}
    </div>
  );
}
