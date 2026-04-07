import { Input } from '@/components/ui/input';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  total: number;
  parcelas: number;
  onParcelasChange: (p: number) => void;
  taxaPct: number;
  totalComTaxa: number;
}

export function PagamentoParcelado({ total, parcelas, onParcelasChange, taxaPct, totalComTaxa }: Props) {
  const valorParcela = parcelas > 0 ? totalComTaxa / parcelas : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Parcelas</p>
      <div className="flex items-center gap-3">
        <div className="relative w-24">
          <Input
            type="number"
            min={1}
            max={12}
            value={parcelas}
            onChange={(e) => {
              const v = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
              onParcelasChange(v);
            }}
            className="min-h-[44px] text-center font-mono text-lg"
          />
        </div>
        <span className="text-sm text-muted-foreground">x de</span>
        <span className="font-mono font-bold text-lg text-foreground">{formatarMoeda(valorParcela)}</span>
      </div>

      {taxaPct > 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa ({taxaPct}%)</span>
            <span className="font-mono">{formatarMoeda(totalComTaxa - total)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Total com acréscimo</span>
            <span className="font-mono">{formatarMoeda(totalComTaxa)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
