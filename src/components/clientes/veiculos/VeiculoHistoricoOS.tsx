import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatarDataCurta } from '@/lib/formatters';
import { formatarMoeda } from '@/lib/formatters';
import { ClipboardList, DollarSign, Calendar, Hash } from 'lucide-react';
import type { OrdemServico, StatusOS } from '@/types/database';

interface Props {
  ordens: OrdemServico[];
  loading: boolean;
}

export function VeiculoHistoricoOS({ ordens, loading }: Props) {
  const navigate = useNavigate();

  if (loading) return <LoadingState variant="table" />;
  if (ordens.length === 0) return (
    <EmptyState icon={ClipboardList} titulo="Sem histórico"
      descricao="Nenhuma ordem de serviço ainda. Quando abrir uma OS pra esse cliente, vai aparecer aqui." />
  );

  const concluidas = ordens.filter(os => os.status === 'concluida' || os.status === 'entregue');
  const totalGasto = concluidas.reduce((s, os) => s + (os.valor_total ?? 0), 0);
  const ultimaVisita = ordens[0]?.criado_em;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Hash className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xl font-bold text-foreground">{ordens.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total de OS</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto text-success mb-1" />
          <p className="text-xl font-bold text-foreground">{formatarMoeda(totalGasto)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Gasto</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <ClipboardList className="h-4 w-4 mx-auto text-info mb-1" />
          <p className="text-xl font-bold text-foreground">{concluidas.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Concluídas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Calendar className="h-4 w-4 mx-auto text-accent mb-1" />
          <p className="text-sm font-bold text-foreground">{ultimaVisita ? formatarDataCurta(ultimaVisita) : '—'}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Última Visita</p>
        </div>
      </div>

      {/* OS list */}
      <div className="space-y-2">
        {ordens.map((os) => (
          <button
            key={os.id}
            onClick={() => navigate(`/os/${os.id}`)}
            className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors text-left"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">OS-{os.numero}</span>
                <StatusBadge status={os.status as StatusOS} />
              </div>
              {os.problema_relatado && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">{os.problema_relatado}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{formatarDataCurta(os.criado_em!)}</p>
            </div>
            {(os.valor_total ?? 0) > 0 && <MoneyDisplay valor={os.valor_total} className="text-sm text-foreground shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
