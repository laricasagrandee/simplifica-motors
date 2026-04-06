import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIAS_FINANCEIRO, CATEGORIAS_LABELS } from './financeiroConstants';

export interface FiltrosState {
  periodo: 'hoje' | 'semana' | 'mes' | 'custom';
  dataInicio: string;
  dataFim: string;
  tipo?: 'entrada' | 'saida';
  categoria?: string;
}

interface Props {
  filtros: FiltrosState;
  onFiltrosChange: (f: FiltrosState) => void;
}

const periodos = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'custom', label: 'Período' },
] as const;

export function calcularDatas(periodo: string) {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  if (periodo === 'hoje') return { dataInicio: hoje, dataFim: hoje };
  if (periodo === 'semana') return { dataInicio: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), dataFim: hoje };
  return { dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'), dataFim: hoje };
}

export function FinanceiroFiltros({ filtros, onFiltrosChange }: Props) {
  const setPeriodo = (p: FiltrosState['periodo']) => {
    const datas = p === 'custom' ? { dataInicio: filtros.dataInicio, dataFim: filtros.dataFim } : calcularDatas(p);
    onFiltrosChange({ ...filtros, periodo: p, ...datas });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {periodos.map(p => (
          <Button key={p.value} size="sm" variant={filtros.periodo === p.value ? 'default' : 'ghost'}
            className={cn('text-xs', filtros.periodo === p.value && 'bg-accent text-accent-foreground')}
            onClick={() => setPeriodo(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>

      {filtros.periodo === 'custom' && (
        <div className="flex gap-2">
          <DatePick value={filtros.dataInicio} onChange={d => onFiltrosChange({ ...filtros, dataInicio: d })} />
          <DatePick value={filtros.dataFim} onChange={d => onFiltrosChange({ ...filtros, dataFim: d })} />
        </div>
      )}

      <Select value={filtros.tipo || 'todas'} onValueChange={v => onFiltrosChange({ ...filtros, tipo: v === 'todas' ? undefined : v as 'entrada' | 'saida' })}>
        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="entrada">Entradas</SelectItem>
          <SelectItem value="saida">Saídas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filtros.categoria || 'todas'} onValueChange={v => onFiltrosChange({ ...filtros, categoria: v === 'todas' ? undefined : v })}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas categorias</SelectItem>
          {CATEGORIAS_FINANCEIRO.map(c => <SelectItem key={c} value={c}>{CATEGORIAS_LABELS[c] ?? c}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function DatePick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value + 'T12:00:00') : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <CalendarIcon className="h-3.5 w-3.5" />
          {value || 'Selecionar'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date}
          onSelect={d => d && onChange(format(d, 'yyyy-MM-dd'))}
          className={cn('p-3 pointer-events-auto')} />
      </PopoverContent>
    </Popover>
  );
}
