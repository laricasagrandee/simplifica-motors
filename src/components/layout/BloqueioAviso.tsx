import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { diasRestantes: number; mensagem: string; }

export function BloqueioAviso({ diasRestantes, mensagem }: Props) {
  const [fechado, setFechado] = useState(false);
  const navigate = useNavigate();
  if (fechado) return null;

  return (
    <div className="bg-warning-light border-b border-warning-border px-4 py-2 flex items-center justify-between gap-3 print:hidden">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
        <p className="text-sm text-warning truncate">
          {mensagem || `Sua assinatura vence em ${diasRestantes} dias. Renove para não perder acesso.`}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button size="sm" onClick={() => navigate('/planos')} className="bg-accent text-accent-foreground text-xs h-8">Renovar</Button>
        <Button size="sm" variant="ghost" onClick={() => setFechado(true)} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
