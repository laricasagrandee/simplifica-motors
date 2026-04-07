import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  diasRestantes: number;
  mensagem: string;
  nivel?: 'suave' | 'forte' | 'urgente' | null;
}

const nivelStyles = {
  suave: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  forte: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  urgente: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 animate-pulse',
};

const nivelIconColor = {
  suave: 'text-amber-500',
  forte: 'text-orange-500',
  urgente: 'text-red-500',
};

const nivelTextColor = {
  suave: 'text-amber-700 dark:text-amber-400',
  forte: 'text-orange-700 dark:text-orange-400',
  urgente: 'text-red-700 dark:text-red-400',
};

export function BloqueioAviso({ diasRestantes, mensagem, nivel }: Props) {
  const [fechado, setFechado] = useState(false);
  const navigate = useNavigate();
  if (fechado) return null;

  const n = nivel || 'suave';
  const bgClass = nivelStyles[n];
  const iconColor = nivelIconColor[n];
  const textColor = nivelTextColor[n];

  return (
    <div className={`border-b px-4 py-2 flex items-center justify-between gap-3 print:hidden ${bgClass}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
        <p className={`text-sm truncate ${textColor}`}>
          {mensagem}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button size="sm" onClick={() => setFechado(true)} variant="ghost" className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
