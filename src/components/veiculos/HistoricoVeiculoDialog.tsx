import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { formatarNumeroOS, formatarDataCurta } from '@/lib/formatters';
import { useHistoricoVeiculo } from '@/hooks/useHistoricoVeiculo';
import { ClipboardList } from 'lucide-react';
import type { StatusOS } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  veiculoId: string;
  veiculoNome: string;
}

export function HistoricoVeiculoDialog({ open, onClose, veiculoId, veiculoNome }: Props) {
  const navigate = useNavigate();
  const { data: historico, isLoading } = useHistoricoVeiculo(veiculoId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Histórico — {veiculoNome}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <LoadingState />
          ) : !historico?.length ? (
            <EmptyState icon={ClipboardList} titulo="Nenhum serviço registrado" descricao="Este veículo ainda não possui ordens de serviço." />
          ) : (
            <div className="relative pl-6 space-y-0">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
              {historico.map((os) => {
                const mec = os.funcionarios as unknown as { nome: string } | null;
                return (
                  <div key={os.id} className="relative pb-5">
                    <div className="absolute left-[-15px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <button
                          onClick={() => { onClose(); navigate(`/os/${os.id}`); }}
                          className="font-mono text-sm font-semibold text-accent hover:underline"
                        >
                          {formatarNumeroOS(os.numero)}
                        </button>
                        <StatusBadge status={os.status as StatusOS} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{os.problema_relatado}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground flex-wrap gap-1">
                        <span>{os.criado_em ? formatarDataCurta(os.criado_em) : '-'}</span>
                        {mec?.nome && <span>Mecânico: {mec.nome}</span>}
                        <MoneyDisplay valor={os.valor_total ?? 0} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
