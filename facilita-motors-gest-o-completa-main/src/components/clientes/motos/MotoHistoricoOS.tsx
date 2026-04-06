import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatarDataCurta } from '@/lib/formatters';
import { ClipboardList } from 'lucide-react';
import type { OrdemServico, StatusOS } from '@/types/database';

interface MotoHistoricoOSProps {
  ordens: OrdemServico[];
  loading: boolean;
}

export function MotoHistoricoOS({ ordens, loading }: MotoHistoricoOSProps) {
  const navigate = useNavigate();

  if (loading) return <LoadingState variant="table" />;
  if (ordens.length === 0) return <EmptyState icon={ClipboardList} titulo="Sem histórico" descricao="Nenhuma OS registrada para este cliente." />;

  return (
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
            <p className="text-xs text-muted-foreground mt-0.5">{formatarDataCurta(os.criado_em!)}</p>
          </div>
          {os.valor_total > 0 && <MoneyDisplay valor={os.valor_total} className="text-sm text-foreground shrink-0" />}
        </button>
      ))}
    </div>
  );
}
