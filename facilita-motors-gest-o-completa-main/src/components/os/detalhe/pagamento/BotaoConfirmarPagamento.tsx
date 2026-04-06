import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { FORMAS_PAGAMENTO } from '@/lib/constants';
import type { FormaPagamento } from '@/types/database';

interface Props {
  forma: FormaPagamento | null;
  total: number;
  parcelas: number;
  disabled: boolean;
  loading: boolean;
  onConfirmar: () => void;
}

export function BotaoConfirmarPagamento({ forma, total, parcelas, disabled, loading, onConfirmar }: Props) {
  const [sucesso, setSucesso] = useState(false);

  const handleClick = () => {
    onConfirmar();
  };

  if (sucesso) {
    return (
      <div className="flex items-center justify-center gap-2 h-16 rounded-xl bg-success text-success-foreground font-bold text-lg animate-in fade-in zoom-in">
        <CheckCircle className="h-6 w-6" />
        Pagamento confirmado!
      </div>
    );
  }

  const label = !forma
    ? 'Selecione a forma de pagamento'
    : `✅ Confirmar ${formatarMoeda(total)} · ${FORMAS_PAGAMENTO[forma]}${parcelas > 1 ? ` ${parcelas}x` : ''}`;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || !forma}
      className="w-full h-16 text-base sm:text-lg font-bold bg-success hover:bg-success/90 text-success-foreground rounded-xl transition-all"
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        label
      )}
    </Button>
  );
}
