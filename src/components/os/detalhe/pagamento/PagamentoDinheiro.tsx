import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  total: number;
  valorRecebido: string;
  onValorChange: (valor: string) => void;
}

export function PagamentoDinheiro({ total, valorRecebido, onValorChange }: Props) {
  const recebido = parseFloat(valorRecebido) || 0;
  const troco = recebido - total;

  const valoresRapidos = [
    { label: '💵 Exato', valor: total },
    { label: 'R$ 50', valor: 50 },
    { label: 'R$ 100', valor: 100 },
    { label: 'R$ 200', valor: 200 },
  ].filter(v => v.valor > 0);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Valor Recebido
      </p>

      <Input
        type="number"
        step="0.01"
        min="0"
        value={valorRecebido}
        onChange={(e) => onValorChange(e.target.value)}
        className="min-h-[48px] text-xl font-mono text-center"
        placeholder="0,00"
      />

      <div className="flex gap-2 flex-wrap">
        {valoresRapidos.map((v) => (
          <Button
            key={v.label}
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[40px]"
            onClick={() => onValorChange(String(v.valor))}
          >
            {v.label === '💵 Exato' ? v.label : formatarMoeda(v.valor)}
          </Button>
        ))}
      </div>

      {recebido > 0 && (
        <div className={`rounded-lg p-3 text-center font-bold text-lg ${
          troco >= 0
            ? 'bg-success/10 text-success border border-success/30'
            : 'bg-destructive/10 text-destructive border border-destructive/30'
        }`}>
          {troco >= 0
            ? `Troco: ${formatarMoeda(troco)}`
            : `Faltam: ${formatarMoeda(Math.abs(troco))}`}
        </div>
      )}
    </div>
  );
}
