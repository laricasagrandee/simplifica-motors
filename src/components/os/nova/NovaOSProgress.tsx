import { Check } from 'lucide-react';

interface Props {
  etapaAtual: number;
}

const STEPS = [
  { num: 1, label: 'Cliente', short: 'Cliente' },
  { num: 2, label: 'Veículo', short: 'Veículo' },
  { num: 3, label: 'Problema', short: 'Problema' },
  { num: 4, label: 'Fotos', short: 'Fotos' },
];

export function NovaOSProgress({ etapaAtual }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = etapaAtual > step.num;
        const active = etapaAtual === step.num;
        const future = etapaAtual < step.num;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done ? 'bg-accent border-accent text-accent-foreground' :
                active ? 'bg-accent border-accent text-accent-foreground' :
                'bg-card border-border text-muted-foreground'
              }`}>
                {done ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {step.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-1 mt-[-12px] ${done ? 'bg-accent' : 'border-t-2 border-dashed border-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
