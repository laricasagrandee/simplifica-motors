import { Bike, Car, Pencil, Trash2, User } from 'lucide-react';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { Button } from '@/components/ui/button';
import type { Veiculo } from '@/types/database';

interface Props {
  veiculo: Veiculo & { clientes: { nome: string } | null };
  onEditar: () => void;
  onExcluir: () => void;
}

export function VeiculoCard({ veiculo: v, onEditar, onExcluir }: Props) {
  const Icon = Bike;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {v.marca} {v.modelo}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {v.placa && <PlacaBadge placa={v.placa} />}
            {v.ano && <span className="text-xs text-muted-foreground">{v.ano}</span>}
            {v.cor && <span className="text-xs text-muted-foreground">· {v.cor}</span>}
          </div>
          {v.clientes?.nome && (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <User className="h-3 w-3" strokeWidth={1.75} /> {v.clientes.nome}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); onEditar(); }}>
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={(e) => { e.stopPropagation(); onExcluir(); }}>
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
