import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Unlock, AlertTriangle } from 'lucide-react';
import { useAbrirCaixa } from '@/hooks/useCaixa';

interface Props {
  onAberto?: () => void;
}

export function CaixaInlineOpener({ onAberto }: Props) {
  const [saldo, setSaldo] = useState('');
  const abrirCaixa = useAbrirCaixa();

  const handleAbrir = () => {
    abrirCaixa.mutate(parseFloat(saldo) || 0, {
      onSuccess: () => onAberto?.(),
    });
    setSaldo('');
  };

  return (
    <div className="rounded-xl border-2 border-warning bg-warning-light p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Caixa fechado</p>
          <p className="text-xs text-muted-foreground">Abra o caixa para liberar o pagamento</p>
        </div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input type="number" step="0.01" placeholder="Saldo abertura (R$)" value={saldo}
            onChange={e => setSaldo(e.target.value)} className="min-h-[44px] font-mono" />
        </div>
        <Button onClick={handleAbrir} disabled={abrirCaixa.isPending} className="min-h-[44px] gap-2 bg-accent text-accent-foreground">
          {abrirCaixa.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
          Abrir Caixa Agora
        </Button>
      </div>
    </div>
  );
}
