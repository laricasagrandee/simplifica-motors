import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  subtotal: number;
  desconto: number;
  tipoDesconto: 'valor' | 'percentual';
  onDescontoChange: (v: number) => void;
  onTipoChange: (t: 'valor' | 'percentual') => void;
}

export function PDVDesconto({ subtotal, desconto, tipoDesconto, onDescontoChange, onTipoChange }: Props) {
  const descontoReais = tipoDesconto === 'percentual' ? (subtotal * desconto) / 100 : desconto;

  const handleChange = (val: string) => {
    const num = parseFloat(val) || 0;
    const max = tipoDesconto === 'percentual' ? 100 : subtotal;
    onDescontoChange(Math.min(Math.max(0, num), max));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Desconto:</span>
      <div className="flex items-center border border-border rounded-md overflow-hidden">
        <Button
          type="button"
          variant={tipoDesconto === 'valor' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none h-9 px-2.5 text-xs"
          onClick={() => onTipoChange('valor')}
        >
          R$
        </Button>
        <Button
          type="button"
          variant={tipoDesconto === 'percentual' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none h-9 px-2.5 text-xs"
          onClick={() => onTipoChange('percentual')}
        >
          %
        </Button>
      </div>
      <Input
        type="number"
        value={desconto || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-24 h-9 text-sm font-mono"
        min={0}
        step={tipoDesconto === 'percentual' ? 1 : 0.01}
      />
      {tipoDesconto === 'percentual' && desconto > 0 && (
        <span className="text-xs text-muted-foreground">= {formatarMoeda(descontoReais)}</span>
      )}
    </div>
  );
}
