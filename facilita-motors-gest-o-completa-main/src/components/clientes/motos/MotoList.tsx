import { Bike, Pencil, Trash2, Plus } from 'lucide-react';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import type { Moto } from '@/types/database';

interface MotoListProps {
  motos: Moto[];
  loading: boolean;
  onAdicionar: () => void;
  onEditar: (m: Moto) => void;
  onDeletar: (m: Moto) => void;
}

export function MotoList({ motos, loading, onAdicionar, onEditar, onDeletar }: MotoListProps) {
  if (loading) return <LoadingState variant="card" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {motos.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-4 card-hover">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Bike className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{m.marca} {m.modelo}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {m.placa && <PlacaBadge placa={m.placa} />}
                  {m.ano && <span className="text-xs text-muted-foreground">{m.ano}</span>}
                  {m.cor && <span className="text-xs text-muted-foreground">· {m.cor}</span>}
                </div>
                {m.quilometragem != null && (
                  <p className="text-xs text-muted-foreground mt-1">{m.quilometragem.toLocaleString('pt-BR')} km</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onEditar(m)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDeletar(m)} className="p-1.5 hover:bg-danger-light rounded-md text-muted-foreground hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={onAdicionar} className="gap-2">
        <Plus className="h-4 w-4" /> Adicionar Moto
      </Button>
    </div>
  );
}
