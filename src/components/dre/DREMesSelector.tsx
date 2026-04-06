import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
}

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function DREMesSelector({ mes, ano, onChange }: Props) {
  const prev = () => {
    if (mes === 1) onChange(12, ano - 1);
    else onChange(mes - 1, ano);
  };
  const next = () => {
    if (mes === 12) onChange(1, ano + 1);
    else onChange(mes + 1, ano);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="ghost" size="icon" onClick={prev} className="min-h-[44px] min-w-[44px]">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="font-display font-semibold text-lg min-w-[180px] text-center">
        {meses[mes - 1]} {ano}
      </span>
      <Button variant="ghost" size="icon" onClick={next} className="min-h-[44px] min-w-[44px]">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
