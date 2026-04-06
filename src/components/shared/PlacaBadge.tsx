import { formatarPlaca } from '@/lib/formatters';

interface PlacaBadgeProps {
  placa: string;
}

export function PlacaBadge({ placa }: PlacaBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded border border-border bg-surface-secondary font-mono text-xs font-medium tracking-wider text-foreground">
      {formatarPlaca(placa)}
    </span>
  );
}
