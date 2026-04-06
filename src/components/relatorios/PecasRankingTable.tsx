import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Medal, Package } from 'lucide-react';

interface Peca { nome: string; qtd: number; receita: number; }
interface Props { pecas: Peca[]; loading: boolean; }
const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

export function PecasRankingTable({ pecas, loading }: Props) {
  if (loading) return <LoadingState />;
  if (!pecas.length) return <EmptyState icon={Package} titulo="Sem dados" descricao="Nenhuma peça vendida no período." />;

  return (
    <div>
      <h3 className="font-display font-semibold text-sm mb-2">Peças Mais Vendidas</h3>
      <div className="space-y-1">
        {pecas.map((p, i) => (
          <div key={p.nome} className="flex items-center justify-between border-b py-2 text-sm">
            <div className="flex items-center gap-2">
              {i < 3 ? <Medal className={`h-4 w-4 ${medalColors[i]}`} /> : <span className="text-xs text-muted-foreground w-4 text-center">{i + 1}</span>}
              <span className="font-medium">{p.nome}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="font-mono">{p.qtd} un</span>
              <MoneyDisplay valor={p.receita} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
