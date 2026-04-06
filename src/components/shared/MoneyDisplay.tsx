import { formatarMoeda } from '@/lib/formatters';

interface MoneyDisplayProps {
  valor: number;
  className?: string;
}

export function MoneyDisplay({ valor, className = '' }: MoneyDisplayProps) {
  return <span className={`font-mono font-medium ${className}`}>{formatarMoeda(valor)}</span>;
}
