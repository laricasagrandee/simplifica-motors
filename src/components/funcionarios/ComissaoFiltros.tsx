import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, subMonths } from 'date-fns';

export type PeriodoComissao = 'este_mes' | 'mes_anterior' | 'custom';

interface Props { periodo: PeriodoComissao; onPeriodoChange: (p: PeriodoComissao) => void; }

const opcoes: { value: PeriodoComissao; label: string }[] = [
  { value: 'este_mes', label: 'Este Mês' }, { value: 'mes_anterior', label: 'Mês Anterior' },
];

export function calcularPeriodoComissao(p: PeriodoComissao) {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  if (p === 'mes_anterior') {
    const inicio = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
    const fim = format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'yyyy-MM-dd');
    return { dataInicio: inicio, dataFim: fim };
  }
  return { dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'), dataFim: hoje };
}

export function ComissaoFiltros({ periodo, onPeriodoChange }: Props) {
  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
      {opcoes.map(o => (
        <Button key={o.value} size="sm" variant={periodo === o.value ? 'default' : 'ghost'}
          className={cn('text-xs', periodo === o.value && 'bg-accent text-accent-foreground')}
          onClick={() => onPeriodoChange(o.value)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}
