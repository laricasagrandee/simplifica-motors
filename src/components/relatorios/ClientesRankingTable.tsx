import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Medal, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Cliente { id: string; nome: string; osCount: number; total: number; }
interface Props { clientes: Cliente[]; loading: boolean; }
const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

export function ClientesRankingTable({ clientes, loading }: Props) {
  const navigate = useNavigate();
  if (loading) return <LoadingState />;
  if (!clientes.length) return <EmptyState icon={Users} titulo="Sem dados" descricao="Nenhum cliente no período." />;

  return (
    <div>
      <h3 className="font-display font-semibold text-sm mb-2">Clientes que Mais Gastaram</h3>
      <div className="space-y-1">
        {clientes.map((c, i) => (
          <div key={c.id} className="flex items-center justify-between border-b py-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1"
            onClick={() => navigate(`/clientes/${c.id}`)}>
            <div className="flex items-center gap-2">
              {i < 3 ? <Medal className={`h-4 w-4 ${medalColors[i]}`} /> : <span className="text-xs text-muted-foreground w-4 text-center">{i + 1}</span>}
              <span className="font-medium">{c.nome}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="font-mono">{c.osCount} OS</span>
              <MoneyDisplay valor={c.total} className="text-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
