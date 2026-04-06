import { Trophy } from 'lucide-react';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import type { MecanicoRank } from '@/hooks/useDashboardRanking';

const MEDALS = ['🥇', '🥈', '🥉'];

interface MecanicoRankingProps {
  data: MecanicoRank[];
  loading: boolean;
}

export function MecanicoRanking({ data, loading }: MecanicoRankingProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-accent" strokeWidth={1.75} />
        <h3 className="font-display font-semibold text-sm text-foreground">Ranking Mecânicos — Mês</h3>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sem dados este mês</p>
      ) : (
        <div className="space-y-2">
          {data.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-lg w-6 text-center">{MEDALS[i] ?? `${i + 1}º`}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {m.total_os} OS{m.pct_os !== undefined ? ` (${m.pct_os}% da meta)` : ''}
                </p>
              </div>
              <MoneyDisplay valor={m.faturamento} className="text-xs text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
