import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  total: number;
  onConfirmar: () => void;
  loading: boolean;
}

export function PDVFecharVenda({ total, onConfirmar, loading }: Props) {
  return (
    <Button
      onClick={onConfirmar}
      disabled={total <= 0 || loading}
      className="w-full h-14 text-lg font-bold gap-2"
    >
      <ShoppingCart className="h-5 w-5" />
      {loading ? 'Processando...' : `Fechar Venda · ${formatarMoeda(total)}`}
    </Button>
  );
}
