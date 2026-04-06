import { cn } from '@/lib/utils';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  total: number;
  parcelas: number;
  onParcelasChange: (p: number) => void;
}

const PARCELAS_MAX = 12;
const PARCELA_MINIMA = 50;

export function PagamentoParcelado({ total, parcelas, onParcelasChange }: Props) {
  const opcoes = Array.from({ length: PARCELAS_MAX }, (_, i) => i + 1)
    .filter(p => total / p >= PARCELA_MINIMA || p === 1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Parcelas
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {opcoes.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onParcelasChange(p)}
            className={cn(
              'rounded-xl border-2 px-2 py-3 text-sm font-medium transition-all cursor-pointer text-center min-h-[56px]',
              parcelas === p
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40'
            )}
          >
            <span className="font-bold text-base">{p}x</span>
            <span className="block text-xs mt-0.5">{formatarMoeda(total / p)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
