import { useState, useMemo } from 'react';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListarAgendamentos, useCancelarAgendamento, type Agendamento } from '@/hooks/useAgendamentos';
import { LoadingState } from '@/components/shared/LoadingState';
import { NovoAgendamentoDialog } from './NovoAgendamentoDialog';

const STATUS_COLORS: Record<string, string> = {
  agendado: 'border-l-blue-500 bg-blue-500/10',
  confirmado: 'border-l-green-500 bg-green-500/10',
  cancelado: 'border-l-red-500 bg-red-500/10 opacity-60',
  concluido: 'border-l-muted-foreground bg-muted/50',
};

export function AgendamentoCalendario() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dialogOpen, setDialogOpen] = useState(false);

  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dataInicio = format(days[0], 'yyyy-MM-dd');
  const dataFim = format(addDays(days[5], 1), 'yyyy-MM-dd');

  const { data: agendamentos, isLoading } = useListarAgendamentos(dataInicio, dataFim);
  const cancelar = useCancelarAgendamento();

  const agrupadoPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    days.forEach((d) => map.set(format(d, 'yyyy-MM-dd'), []));
    agendamentos?.forEach((ag) => {
      const key = ag.data_hora.slice(0, 10);
      map.get(key)?.push(ag);
    });
    return map;
  }, [agendamentos, days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart((p) => addDays(p, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(days[0], "dd MMM", { locale: ptBR })} — {format(days[5], "dd MMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setWeekStart((p) => addDays(p, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const items = agrupadoPorDia.get(key) ?? [];
            const isToday = isSameDay(day, new Date());
            return (
              <div key={key} className={`rounded-lg border p-2 min-h-[180px] ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className={`text-xs font-semibold mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, "EEE dd", { locale: ptBR }).toUpperCase()}
                </p>
                <div className="space-y-1.5">
                  {items.map((ag) => (
                    <div key={ag.id} className={`border-l-2 rounded px-2 py-1.5 text-xs ${STATUS_COLORS[ag.status] ?? ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{format(new Date(ag.data_hora), 'HH:mm')}</span>
                        {ag.status === 'agendado' && (
                          <button onClick={() => cancelar.mutate(ag.id)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-foreground truncate">{(ag.clientes as any)?.nome ?? '—'}</p>
                      <p className="text-muted-foreground truncate">
                        {(ag.motos as any)?.placa ?? ''} · {(ag.funcionarios as any)?.nome ?? ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NovoAgendamentoDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
