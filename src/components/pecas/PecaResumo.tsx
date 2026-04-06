import { formatarMoeda } from '@/lib/formatters';

interface Props {
  totalPecas: number;
  valorEstoque: number;
  qtdAlerta: number;
}

export function PecaResumo({ totalPecas, valorEstoque, qtdAlerta }: Props) {
  return (
    <p className="text-sm text-muted-foreground mb-4">
      {totalPecas} peça{totalPecas !== 1 ? 's' : ''} · Estoque: {formatarMoeda(valorEstoque)}
      {qtdAlerta > 0 && (
        <span className="text-danger font-medium"> · {qtdAlerta} alerta{qtdAlerta !== 1 ? 's' : ''}</span>
      )}
    </p>
  );
}
