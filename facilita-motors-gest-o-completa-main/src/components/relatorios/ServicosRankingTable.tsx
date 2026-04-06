import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Wrench } from 'lucide-react';

interface Servico { descricao: string; count: number; receita: number; }
interface Props { servicos: Servico[]; loading: boolean; }

export function ServicosRankingTable({ servicos, loading }: Props) {
  if (loading) return <LoadingState />;
  if (!servicos.length) return <EmptyState icon={Wrench} titulo="Sem dados" descricao="Nenhum serviço no período." />;

  return (
    <div>
      <h3 className="font-display font-semibold text-sm mb-2">Serviços Mais Realizados</h3>
      <div className="space-y-1">
        {servicos.map(s => (
          <div key={s.descricao} className="flex items-center justify-between border-b py-2 text-sm">
            <span className="font-medium">{s.descricao}</span>
            <div className="flex gap-4 text-xs">
              <span className="font-mono">{s.count}x</span>
              <MoneyDisplay valor={s.receita} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
