import { Banknote, Smartphone, CreditCard, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormaPagamento } from '@/types/database';

interface Props {
  forma: FormaPagamento | null;
  onSelect: (forma: FormaPagamento) => void;
}

const FORMAS: { id: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { id: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="h-6 w-6" /> },
  { id: 'pix', label: 'PIX', icon: <Smartphone className="h-6 w-6" /> },
  { id: 'cartao_debito', label: 'Débito', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'cartao_credito', label: 'Crédito', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'boleto', label: 'Boleto', icon: <Receipt className="h-6 w-6" /> },
];

export function FormaPagamentoBotoes({ forma, onSelect }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
        Forma de Pagamento
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {FORMAS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 sm:p-4 text-sm font-medium transition-all cursor-pointer min-h-[72px]',
              forma === f.id
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40'
            )}
          >
            {f.icon}
            <span className="text-xs sm:text-sm">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
