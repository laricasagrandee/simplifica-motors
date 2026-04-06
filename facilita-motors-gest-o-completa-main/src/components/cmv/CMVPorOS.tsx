import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import { formatarNumeroOS } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';

interface OSItem {
  id: string;
  numero: number | string;
  cliente: string;
  faturamento: number;
  custo: number;
  lucro: number;
  margem: number;
}

interface Props {
  ordens: OSItem[];
  loading: boolean;
}

function MargemBadge({ margem }: { margem: number }) {
  const c = margem >= 40 ? 'text-success' : margem >= 20 ? 'text-warning' : 'text-destructive';
  return <span className={`font-mono text-sm font-medium ${c}`}>{margem.toFixed(1)}%</span>;
}

export function CMVPorOS({ ordens, loading }: Props) {
  const navigate = useNavigate();
  if (loading) return <LoadingState />;
  if (!ordens.length) return <EmptyState icon={FileText} titulo="Sem dados" descricao="Nenhuma OS no período." />;

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">Nº OS</th><th className="p-2">Cliente</th><th className="p-2 text-right">Faturamento</th>
            <th className="p-2 text-right">Custo</th><th className="p-2 text-right">Lucro</th><th className="p-2 text-right">Margem</th>
          </tr></thead>
          <tbody>{ordens.map(o => (
            <tr key={o.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/os/${o.id}`)}>
              <td className="p-2 font-mono text-accent">{formatarNumeroOS(o.numero)}</td>
              <td className="p-2">{o.cliente}</td>
              <td className="p-2 text-right"><MoneyDisplay valor={o.faturamento} /></td>
              <td className="p-2 text-right"><MoneyDisplay valor={o.custo} className="text-destructive" /></td>
              <td className="p-2 text-right"><MoneyDisplay valor={o.lucro} className="text-success" /></td>
              <td className="p-2 text-right"><MargemBadge margem={o.margem} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="md:hidden space-y-2">
        {ordens.map(o => (
          <div key={o.id} className="rounded-lg border bg-card p-3 cursor-pointer" onClick={() => navigate(`/os/${o.id}`)}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-accent text-sm">{formatarNumeroOS(o.numero)}</span>
              <MargemBadge margem={o.margem} />
            </div>
            <p className="text-sm">{o.cliente}</p>
            <div className="flex justify-between mt-1 text-xs">
              <MoneyDisplay valor={o.lucro} className="text-success" />
              <span className="text-muted-foreground">de <MoneyDisplay valor={o.faturamento} /></span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
