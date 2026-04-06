import { useCaixaStatus } from '@/hooks/useCaixaStatus';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Button } from '@/components/ui/button';
import { Loader2, Unlock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CaixaStatusBadge({ className }: { className?: string }) {
  const { caixaAberto, saldoAtual, loading, abrirCaixaRapido, abrindoCaixa } = useCaixaStatus();

  if (loading) return null;

  if (caixaAberto) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1', className)}>
        <Lock className="h-3 w-3 text-success" />
        <span className="text-xs font-medium text-success">Caixa Aberto</span>
        <MoneyDisplay valor={saldoAtual} className="text-xs font-semibold text-success" />
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        ❌ Caixa Fechado
      </span>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-destructive text-destructive"
        onClick={abrirCaixaRapido} disabled={abrindoCaixa}>
        {abrindoCaixa ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3" />}
        Abrir
      </Button>
    </div>
  );
}
