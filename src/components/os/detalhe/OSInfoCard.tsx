import { useState } from 'react';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import { Bike, User, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HistoricoVeiculoDialog } from '@/components/veiculos/HistoricoVeiculoDialog';
import type { Cliente, Veiculo } from '@/types/database';

interface Props {
  cliente: Cliente;
  veiculo: Veiculo;
}

export function OSInfoCard({ cliente, veiculo }: Props) {
  const navigate = useNavigate();
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const Icon = Bike;
  const doc = cliente.cpf_cnpj?.replace(/\D/g, '');

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground">{cliente.nome}</p>
              {cliente.telefone && <p className="text-xs text-muted-foreground">{formatarTelefone(cliente.telefone)}</p>}
              {doc && <p className="text-xs font-mono text-muted-foreground">{doc.length > 11 ? formatarCNPJ(doc) : formatarCPF(doc)}</p>}
              <button onClick={() => navigate(`/clientes/${cliente.id}`)} className="text-xs text-accent hover:underline mt-1">Ver perfil →</button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground">{veiculo.marca} {veiculo.modelo}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {veiculo.placa && <PlacaBadge placa={veiculo.placa} />}
                {veiculo.ano && <span className="text-xs text-muted-foreground">{veiculo.ano}</span>}
                {veiculo.cor && <span className="text-xs text-muted-foreground">· {veiculo.cor}</span>}
              </div>
              {veiculo.quilometragem != null && <p className="text-xs text-muted-foreground mt-0.5">{veiculo.quilometragem.toLocaleString('pt-BR')} km</p>}
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 mt-1 h-7 text-xs text-accent" onClick={() => setHistoricoOpen(true)}>
                <History className="h-3.5 w-3.5" /> Ver Histórico
              </Button>
            </div>
          </div>
        </div>
      </div>

      <HistoricoVeiculoDialog
        open={historicoOpen}
        onClose={() => setHistoricoOpen(false)}
        veiculoId={veiculo.id}
        veiculoNome={`${veiculo.marca} ${veiculo.modelo} ${veiculo.placa}`}
      />
    </>
  );
}
