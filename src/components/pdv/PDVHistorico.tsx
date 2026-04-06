import { Clock } from 'lucide-react';
import { useHistoricoVendas } from '@/hooks/usePDV';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Badge } from '@/components/ui/badge';

const FORMA_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Débito',
  cartao_credito: 'Crédito',
  boleto: 'Boleto',
};

export function PDVHistorico() {
  const { data, isLoading } = useHistoricoVendas(1);
  const vendas = data?.data ?? [];

  if (isLoading) return <LoadingState />;
  if (vendas.length === 0) {
    return <EmptyState icon={Clock} titulo="Sem vendas hoje" descricao="As vendas do dia aparecerão aqui." />;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-sm text-foreground">Vendas de Hoje</h3>
      {vendas.map((v: any) => (
        <div key={v.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">
              {new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {v.clientes?.nome ?? 'Sem cliente'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{FORMA_LABELS[v.forma_pagamento] ?? v.forma_pagamento}</Badge>
            <MoneyDisplay valor={v.valor_total} className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
