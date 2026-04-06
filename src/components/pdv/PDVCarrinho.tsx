import { ShoppingCart } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PDVCarrinhoItem, type CarrinhoItem } from './PDVCarrinhoItem';
import { PDVDesconto } from './PDVDesconto';
import { PDVResumo } from './PDVResumo';
import { PDVFecharVenda } from './PDVFecharVenda';

interface Props {
  itens: CarrinhoItem[];
  onAlterarQtd: (pecaId: string, qtd: number) => void;
  onRemover: (pecaId: string) => void;
  subtotal: number;
  desconto: number;
  tipoDesconto: 'valor' | 'percentual';
  onDescontoChange: (v: number) => void;
  onTipoDescontoChange: (t: 'valor' | 'percentual') => void;
  total: number;
  onFechar: () => void;
  loading: boolean;
}

export function PDVCarrinho({
  itens, onAlterarQtd, onRemover,
  subtotal, desconto, tipoDesconto, onDescontoChange, onTipoDescontoChange,
  total, onFechar, loading,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-bold text-foreground">Carrinho ({itens.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {itens.length === 0 ? (
          <EmptyState icon={ShoppingCart} titulo="Carrinho vazio" descricao="Busque peças para adicionar" />
        ) : (
          itens.map((item) => (
            <PDVCarrinhoItem key={item.peca_id} item={item} onAlterarQtd={onAlterarQtd} onRemover={onRemover} />
          ))
        )}
      </div>

      {itens.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <PDVDesconto
            subtotal={subtotal}
            desconto={desconto}
            tipoDesconto={tipoDesconto}
            onDescontoChange={onDescontoChange}
            onTipoChange={onTipoDescontoChange}
          />
          <PDVResumo subtotal={subtotal} desconto={desconto} total={total} tipoDesconto={tipoDesconto} />
          <PDVFecharVenda total={total} onConfirmar={onFechar} loading={loading} />
        </div>
      )}
    </div>
  );
}
