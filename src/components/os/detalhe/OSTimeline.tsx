import { Check } from 'lucide-react';
import type { OrdemServico, StatusOS } from '@/types/database';

interface Props { os: OrdemServico; }

const STEPS: { status: StatusOS; label: string }[] = [
  { status: 'aberta', label: 'Aberta' },
  { status: 'em_orcamento', label: 'Orçamento' },
  { status: 'aprovada', label: 'Aprovada' },
  { status: 'em_execucao', label: 'Execução' },
  { status: 'concluida', label: 'Pronta' },
  { status: 'entregue', label: 'Entregue' },
];

const ORDER: Record<StatusOS, number> = {
  aberta: 0, em_orcamento: 1, aprovada: 2,
  em_execucao: 3, concluida: 4, entregue: 5, cancelada: -1,
};

export function OSTimeline({ os }: Props) {
  const currentIdx = ORDER[os.status] ?? -1;

  if (os.status === 'cancelada') {
    return (
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-danger-light border border-danger-border">
        <span className="text-xs font-semibold text-danger">OS Cancelada</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1 scrollbar-hide">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                done
                  ? 'bg-primary text-primary-foreground'
                  : active
                    ? 'bg-primary text-primary-foreground ring-[3px] ring-primary/20'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-[9px] leading-tight whitespace-nowrap ${
                active ? 'font-bold text-foreground' : done ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 sm:w-6 h-[2px] mx-0 mt-[-10px] shrink-0 ${
                done ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
