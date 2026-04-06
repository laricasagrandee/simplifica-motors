import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PeriodoCMV = '1m' | '3m' | '6m' | '1a' | 'custom';

interface Props {
  periodo: PeriodoCMV;
  onPeriodoChange: (p: PeriodoCMV) => void;
}

const opcoes: { value: PeriodoCMV; label: string }[] = [
  { value: '1m', label: 'Este Mês' },
  { value: '3m', label: '3 Meses' },
  { value: '6m', label: '6 Meses' },
  { value: '1a', label: 'Este Ano' },
];

export function CMVFiltros({ periodo, onPeriodoChange }: Props) {
  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
      {opcoes.map(o => (
        <Button key={o.value} size="sm" variant={periodo === o.value ? 'default' : 'ghost'}
          className={cn('text-xs whitespace-nowrap', periodo === o.value && 'bg-accent text-accent-foreground')}
          onClick={() => onPeriodoChange(o.value)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export function calcularPeriodoCMV(p: PeriodoCMV) {
  const now = new Date();
  const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (p === '1m') {
    const inicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { dataInicio: inicio, dataFim: hoje };
  }
  if (p === '3m') {
    const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { dataInicio: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, dataFim: hoje };
  }
  if (p === '6m') {
    const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return { dataInicio: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, dataFim: hoje };
  }
  return { dataInicio: `${now.getFullYear()}-01-01`, dataFim: hoje };
}
