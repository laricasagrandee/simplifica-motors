import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface Props {
  estoqueAtual: number;
  estoqueMinimo: number;
}

export function AlertaEstoque({ estoqueAtual, estoqueMinimo }: Props) {
  if (estoqueAtual > estoqueMinimo) return null;

  return (
    <Badge className="bg-danger-light text-danger border-danger-border text-xs gap-1">
      <AlertTriangle className="h-3 w-3" strokeWidth={1.75} />
      Estoque baixo
    </Badge>
  );
}
