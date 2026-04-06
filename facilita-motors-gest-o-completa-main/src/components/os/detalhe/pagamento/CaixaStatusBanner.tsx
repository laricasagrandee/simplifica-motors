import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Loader2, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { useAbrirCaixa } from '@/hooks/useCaixa';
import type { Caixa } from '@/types/database';

interface Props {
  caixa: Caixa | null;
  caixaLoading: boolean;
}

export function CaixaStatusBanner({ caixa, caixaLoading }: Props) {
  const [saldoAbertura, setSaldoAbertura] = useState('');
  const abrirCaixa = useAbrirCaixa();

  if (caixaLoading) return null;

  if (!caixa || caixa.status !== 'aberto') {
    return (
      <div className="rounded-xl border-2 border-warning bg-warning-light p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Caixa fechado</p>
            <p className="text-xs text-muted-foreground">Abra o caixa para registrar o pagamento</p>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input type="number" step="0.01" placeholder="Saldo abertura (R$)" value={saldoAbertura}
              onChange={e => setSaldoAbertura(e.target.value)} className="min-h-[44px] font-mono" />
          </div>
          <Button onClick={() => { abrirCaixa.mutate(parseFloat(saldoAbertura) || 0); setSaldoAbertura(''); }}
            disabled={abrirCaixa.isPending} className="min-h-[44px] gap-2">
            {abrirCaixa.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Abrir Caixa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-success/30 bg-success-light/50 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-foreground">Caixa aberto</span>
        <Badge variant="outline" className="text-xs bg-success-light text-success border-success/30">
          Entradas: {formatarMoeda(caixa.total_entradas ?? 0)}
        </Badge>
      </div>
      <MoneyDisplay valor={(caixa.saldo_abertura ?? 0) + (caixa.total_entradas ?? 0) - (caixa.total_saidas ?? 0)} className="text-sm font-semibold" />
    </div>
  );
}
