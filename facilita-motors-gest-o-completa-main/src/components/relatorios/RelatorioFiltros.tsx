import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

export interface PeriodoRelatorio { dataInicio: string; dataFim: string; }
export type TipoPeriodo = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom';

interface Props { periodo: TipoPeriodo; datas: PeriodoRelatorio; onPeriodoChange: (p: TipoPeriodo) => void; onDatasChange: (d: PeriodoRelatorio) => void; }

const opcoes: { value: TipoPeriodo; label: string }[] = [
  { value: 'hoje', label: 'Hoje' }, { value: 'semana', label: 'Semana' }, { value: 'mes', label: 'Mês' },
  { value: 'trimestre', label: 'Trimestre' }, { value: 'ano', label: 'Ano' }, { value: 'custom', label: 'Período' },
];

export function calcularPeriodoRelatorio(p: TipoPeriodo): PeriodoRelatorio {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  if (p === 'hoje') return { dataInicio: hoje, dataFim: hoje };
  if (p === 'semana') return { dataInicio: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), dataFim: hoje };
  if (p === 'trimestre') return { dataInicio: format(startOfQuarter(new Date()), 'yyyy-MM-dd'), dataFim: hoje };
  if (p === 'ano') return { dataInicio: format(startOfYear(new Date()), 'yyyy-MM-dd'), dataFim: hoje };
  return { dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'), dataFim: hoje };
}

export function RelatorioFiltros({ periodo, datas, onPeriodoChange, onDatasChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {opcoes.map(o => (
          <Button key={o.value} size="sm" variant={periodo === o.value ? 'default' : 'ghost'}
            className={cn('text-xs whitespace-nowrap', periodo === o.value && 'bg-accent text-accent-foreground')}
            onClick={() => onPeriodoChange(o.value)}>
            {o.label}
          </Button>
        ))}
      </div>
      {periodo === 'custom' && (
        <div className="flex gap-2">
          <DateBtn value={datas.dataInicio} onChange={d => onDatasChange({ ...datas, dataInicio: d })} />
          <DateBtn value={datas.dataFim} onChange={d => onDatasChange({ ...datas, dataFim: d })} />
        </div>
      )}
    </div>
  );
}

function DateBtn({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value + 'T12:00:00') : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1"><CalendarIcon className="h-3.5 w-3.5" />{value || 'Data'}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={d => d && onChange(format(d, 'yyyy-MM-dd'))} className={cn('p-3 pointer-events-auto')} />
      </PopoverContent>
    </Popover>
  );
}
