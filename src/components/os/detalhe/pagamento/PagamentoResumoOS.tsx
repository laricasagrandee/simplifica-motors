import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import type { OrdemServico, OSItem } from '@/types/database';

interface Props {
  os: OrdemServico;
  itens: OSItem[];
}

export function PagamentoResumoOS({ os, itens }: Props) {
  const cliente = os.clientes;
  const veiculo = os.motos;
  const pecas = itens.filter(i => i.tipo === 'peca');
  const servicos = itens.filter(i => i.tipo === 'servico');
  const total = Number(os.valor_total) || 0;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      {/* Cliente e veículo */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
        <div>
          <span className="text-muted-foreground">Cliente: </span>
          <span className="font-medium text-foreground">{cliente?.nome || '—'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Veículo: </span>
          <span className="font-medium text-foreground">
            {veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.placa}` : '—'}
          </span>
        </div>
      </div>

      {/* Itens resumidos */}
      {itens.length > 0 && (
        <div className="space-y-1 border-t border-border pt-2">
          {servicos.map(s => (
            <div key={s.id} className="flex justify-between text-xs text-muted-foreground">
              <span>🔧 {s.descricao}</span>
              <MoneyDisplay valor={s.valor_total} className="text-xs" />
            </div>
          ))}
          {pecas.map(p => (
            <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
              <span>📦 {p.quantidade}x {p.descricao}</span>
              <MoneyDisplay valor={p.valor_total} className="text-xs" />
            </div>
          ))}
          {(os.desconto ?? 0) > 0 && (
            <div className="flex justify-between text-xs text-destructive">
              <span>Desconto</span>
              <span>-<MoneyDisplay valor={os.desconto ?? 0} className="text-xs" /></span>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="border-t border-border pt-3 flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">Total a pagar</span>
        <MoneyDisplay valor={total} className="text-3xl sm:text-4xl font-display font-bold" />
      </div>
    </div>
  );
}
