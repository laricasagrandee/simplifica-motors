import { Separator } from '@/components/ui/separator';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  subtotal: number;
  desconto: number;
  total: number;
  tipoDesconto: 'valor' | 'percentual';
}

export function PDVResumo({ subtotal, desconto, total, tipoDesconto }: Props) {
  const descontoReais = tipoDesconto === 'percentual' ? (subtotal * desconto) / 100 : desconto;

  return (
    <div className="bg-[hsl(var(--surface-secondary))] rounded-lg p-3 space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-mono text-muted-foreground">{formatarMoeda(subtotal)}</span>
      </div>
      {descontoReais > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-destructive">Desconto</span>
          <span className="font-mono text-destructive">-{formatarMoeda(descontoReais)}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between items-center">
        <span className="font-display font-bold text-foreground">TOTAL</span>
        <span className="font-display text-2xl font-bold text-primary">{formatarMoeda(total)}</span>
      </div>
    </div>
  );
}
