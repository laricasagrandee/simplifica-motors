import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';

export interface CarrinhoItem {
  peca_id: string;
  nome: string;
  codigo: string | null;
  valor_unitario: number;
  quantidade: number;
  estoque_max: number;
}

interface Props {
  item: CarrinhoItem;
  onAlterarQtd: (pecaId: string, qtd: number) => void;
  onRemover: (pecaId: string) => void;
}

export function PDVCarrinhoItem({ item, onAlterarQtd, onRemover }: Props) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.nome}</p>
        <p className="text-xs text-muted-foreground font-mono">{item.codigo ?? '—'}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlterarQtd(item.peca_id, Math.max(1, item.quantidade - 1))}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-mono font-medium">{item.quantidade}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={item.quantidade >= item.estoque_max}
          onClick={() => onAlterarQtd(item.peca_id, item.quantidade + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <MoneyDisplay valor={item.valor_unitario * item.quantidade} className="text-sm w-24 text-right" />

      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemover(item.peca_id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
