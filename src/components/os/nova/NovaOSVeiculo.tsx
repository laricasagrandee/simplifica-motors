import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { Bike, Car, Plus } from 'lucide-react';
import { useVeiculosPorCliente } from '@/hooks/useVeiculos';
import { formatarKm, parsarKm } from '@/lib/formatters';
import type { Veiculo } from '@/types/database';

interface Props {
  clienteId: string;
  veiculoSelecionado: Veiculo | null;
  quilometragem: string;
  onSelecionar: (v: Veiculo) => void;
  onQuilometragemChange: (v: string) => void;
  onNovoVeiculo: () => void;
  onVoltar: () => void;
  onProximo: () => void;
}

export function NovaOSVeiculo({ clienteId, veiculoSelecionado, quilometragem, onSelecionar, onQuilometragemChange, onNovoVeiculo, onVoltar, onProximo }: Props) {
  const { data: veiculos, isLoading } = useVeiculosPorCliente(clienteId);

  if (isLoading) return <LoadingState variant="card" />;

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">Selecione o Veículo</h3>

      {(veiculos ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Este cliente não tem veículos cadastrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {veiculos?.map((v) => {
            const Icon = Bike;
            const selected = veiculoSelecionado?.id === v.id;
            return (
              <button key={v.id} onClick={() => onSelecionar(v)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selected ? 'border-accent bg-accent-light shadow-sm' : 'border-border bg-card hover:bg-muted/30'
                }`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{v.marca} {v.modelo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {v.placa && <PlacaBadge placa={v.placa} />}
                      {v.ano && <span className="text-xs text-muted-foreground">{v.ano}</span>}
                    </div>
                    {v.quilometragem != null && <p className="text-xs text-muted-foreground mt-0.5">{v.quilometragem.toLocaleString('pt-BR')} km</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button onClick={onNovoVeiculo} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
        <Plus className="h-3.5 w-3.5" /> Adicionar Veículo
      </button>

      {veiculoSelecionado && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quilometragem Atual</Label>
          <Input value={formatarKm(quilometragem)} onChange={(e) => onQuilometragemChange(parsarKm(e.target.value))} inputMode="numeric" placeholder="Ex: 35.000" className="max-w-[200px] min-h-[44px]" />
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onVoltar}>← Voltar</Button>
        <Button onClick={onProximo} disabled={!veiculoSelecionado}>Próximo →</Button>
      </div>
    </div>
  );
}
