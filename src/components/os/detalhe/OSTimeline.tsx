import { Check } from 'lucide-react';
import { formatarDataCurta } from '@/lib/formatters';
import type { OrdemServico, StatusOS } from '@/types/database';

interface Props { os: OrdemServico; }

const STEPS: { status: StatusOS; label: string; tsKey?: keyof OrdemServico }[] = [
  { status: 'aberta', label: 'Aberta', tsKey: 'criado_em' },
  { status: 'em_orcamento', label: 'Orçamento' },
  { status: 'aprovada', label: 'Aprovada', tsKey: 'data_aprovacao' },
  { status: 'em_execucao', label: 'Execução' },
  { status: 'concluida', label: 'Concluída', tsKey: 'data_conclusao' },
  { status: 'entregue', label: 'Entregue', tsKey: 'data_entrega' },
];

const ORDER: Record<StatusOS, number> = { aberta: 0, em_orcamento: 1, aprovada: 2, em_execucao: 3, concluida: 4, entregue: 5, cancelada: -1 };

export function OSTimeline({ os }: Props) {
  const currentIdx = ORDER[os.status] ?? -1;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 mb-6 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const ts = step.tsKey ? (os[step.tsKey] as string | null) : null;
        return (
          <div key={step.status} className="flex items-center sm:flex-row flex-row">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                done ? 'bg-accent border-accent text-accent-foreground' :
                active ? 'bg-accent border-accent text-accent-foreground ring-4 ring-accent/20' :
                'bg-card border-border text-muted-foreground'
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[9px] mt-0.5 whitespace-nowrap ${active ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
              {ts && done && <span className="text-[8px] text-muted-foreground">{formatarDataCurta(ts)}</span>}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 mx-0.5 mt-[-16px] ${done ? 'bg-accent' : 'border-t-2 border-dashed border-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
