import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_OS_CONFIG } from '@/lib/constants';
import type { StatusOS } from '@/types/database';

interface Contadores {
  aberta: number; em_orcamento: number; aprovada: number;
  em_execucao: number; concluida: number; entregue: number;
  cancelada: number; total: number;
}

interface Props {
  contadores: Contadores | undefined;
  loading: boolean;
  statusFiltro?: string;
  onStatusClick: (status: StatusOS | '') => void;
}

const ITEMS: { key: StatusOS | ''; label: string; countKey: keyof Contadores }[] = [
  { key: '', label: 'Todas', countKey: 'total' },
  { key: 'aberta', label: 'Aberta', countKey: 'aberta' },
  { key: 'em_orcamento', label: 'Orçamento Enviado', countKey: 'em_orcamento' },
  { key: 'aprovada', label: 'Aprovada', countKey: 'aprovada' },
  { key: 'em_execucao', label: 'Em Serviço', countKey: 'em_execucao' },
  { key: 'concluida', label: 'Pronto', countKey: 'concluida' },
  { key: 'entregue', label: 'Retirado', countKey: 'entregue' },
];

export function OSContadores({ contadores, loading, statusFiltro, onStatusClick }: Props) {
  if (loading) return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {ITEMS.map((i) => <Skeleton key={i.label} className="h-8 w-28 shrink-0 rounded-full" />)}
    </div>
  );

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 pr-4 scrollbar-hide">
      {ITEMS.map((item) => {
        const count = contadores?.[item.countKey] ?? 0;
        if (item.key !== '' && count === 0) return null;
        const active = statusFiltro === item.key;
        const cfg = item.key ? STATUS_OS_CONFIG[item.key] : null;
        const cls = cfg?.className ?? 'bg-[hsl(var(--surface-secondary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]';
        return (
          <button key={item.label} onClick={() => onStatusClick(active ? '' : item.key)}>
            <Badge variant="outline" className={`cursor-pointer text-xs px-3 py-1.5 whitespace-nowrap ${cls} ${active ? 'ring-2 ring-[hsl(var(--accent))] ring-offset-1' : ''}`}>
              {item.label}: {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
