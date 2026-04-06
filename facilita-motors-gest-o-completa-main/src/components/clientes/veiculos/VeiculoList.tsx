import { Bike, Car, Pencil, Trash2, Plus } from 'lucide-react';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import type { Veiculo } from '@/types/database';

interface VeiculoListProps {
  veiculos: Veiculo[];
  loading: boolean;
  onAdicionar: () => void;
  onEditar: (v: Veiculo) => void;
  onDeletar: (v: Veiculo) => void;
}

export function VeiculoList({ veiculos, loading, onAdicionar, onEditar, onDeletar }: VeiculoListProps) {
  if (loading) return <LoadingState variant="card" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {veiculos.map((v) => {
          const Icon = Bike;
          return (
            <div key={v.id} className="bg-card border border-border rounded-xl p-4 card-hover">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{v.marca} {v.modelo}</p>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      moto
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {v.placa && <PlacaBadge placa={v.placa} />}
                    {v.ano && <span className="text-xs text-muted-foreground">{v.ano}</span>}
                    {v.cor && <span className="text-xs text-muted-foreground">· {v.cor}</span>}
                  </div>
                  {v.quilometragem != null && (
                    <p className="text-xs text-muted-foreground mt-1">{v.quilometragem.toLocaleString('pt-BR')} km</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEditar(v)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDeletar(v)} className="p-1.5 hover:bg-danger-light rounded-md text-muted-foreground hover:text-danger min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="outline" onClick={onAdicionar} className="gap-2">
        <Plus className="h-4 w-4" /> Adicionar Veículo
      </Button>
    </div>
  );
}
