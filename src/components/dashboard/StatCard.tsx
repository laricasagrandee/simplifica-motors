import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';

interface StatCardProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  cor: string;
  loading: boolean;
  isMoney?: boolean;
}

export function StatCard({ titulo, valor, icone: Icon, cor, loading, isMoney = false }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {titulo}
        </span>
        <Icon className={`h-4 w-4 ${cor}`} strokeWidth={1.75} />
      </div>
      {loading ? (
        <Skeleton className="h-7 w-20 rounded" />
      ) : isMoney ? (
        <MoneyDisplay valor={valor} className="text-xl text-foreground" />
      ) : (
        <span className="text-xl font-display font-bold text-foreground">{valor}</span>
      )}
    </div>
  );
}
