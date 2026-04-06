import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Bike, Car } from 'lucide-react';

interface Veiculo { marca: string; modelo: string; tipo: string; count: number; }
interface Props { veiculos: Veiculo[]; loading: boolean; }

export function VeiculosRankingTable({ veiculos, loading }: Props) {
  if (loading) return <LoadingState />;
  if (!veiculos.length) return <EmptyState icon={Car} titulo="Sem dados" descricao="Nenhum veículo atendido no período." />;

  return (
    <div>
      <h3 className="font-display font-semibold text-sm mb-2">Veículos Mais Atendidos</h3>
      <div className="space-y-1">
        {veiculos.map((v, i) => {
          const Icon = v.tipo === 'moto' ? Bike : Car;
          return (
            <div key={`${v.marca}-${v.modelo}`} className="flex items-center justify-between border-b py-2 text-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{v.marca} {v.modelo}</span>
              </div>
              <span className="font-mono text-xs">{v.count} atendimentos</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
