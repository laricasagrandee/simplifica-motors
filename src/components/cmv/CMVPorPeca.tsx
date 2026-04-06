import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Medal, Package } from 'lucide-react';

interface PecaItem {
  nome: string;
  qtd: number;
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
}

interface Props {
  pecas: PecaItem[];
  loading: boolean;
}

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

export function CMVPorPeca({ pecas, loading }: Props) {
  const [asc, setAsc] = useState(false);
  if (loading) return <LoadingState />;
  if (!pecas.length) return <EmptyState icon={Package} titulo="Sem dados" descricao="Nenhuma peça vendida no período." />;

  const sorted = asc ? [...pecas].reverse() : pecas;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant={!asc ? 'default' : 'outline'} onClick={() => setAsc(false)} className="text-xs">Mais rentáveis</Button>
        <Button size="sm" variant={asc ? 'default' : 'outline'} onClick={() => setAsc(true)} className="text-xs">Menos rentáveis</Button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">#</th><th className="p-2">Peça</th><th className="p-2 text-right">Qtd</th>
            <th className="p-2 text-right">Receita</th><th className="p-2 text-right">Custo</th>
            <th className="p-2 text-right">Lucro</th><th className="p-2 text-right">Margem</th>
          </tr></thead>
          <tbody>{sorted.map((p, i) => (
            <tr key={p.nome} className="border-b hover:bg-muted/50">
              <td className="p-2">{i < 3 ? <Medal className={`h-4 w-4 ${medalColors[i]}`} /> : <span className="text-xs text-muted-foreground">{i + 1}</span>}</td>
              <td className="p-2 font-medium">{p.nome}</td>
              <td className="p-2 text-right font-mono">{p.qtd}</td>
              <td className="p-2 text-right"><MoneyDisplay valor={p.receita} /></td>
              <td className="p-2 text-right"><MoneyDisplay valor={p.custo} className="text-destructive" /></td>
              <td className="p-2 text-right"><MoneyDisplay valor={p.lucro} className="text-success" /></td>
              <td className="p-2 text-right"><MargemText margem={p.margem} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {sorted.map((p, i) => (
          <div key={p.nome} className="rounded-lg border bg-card p-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {i < 3 && <Medal className={`h-4 w-4 ${medalColors[i]}`} />}
                <span className="text-sm font-medium">{p.nome}</span>
              </div>
              <MargemText margem={p.margem} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{p.qtd} un</span>
              <MoneyDisplay valor={p.lucro} className="text-success" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MargemText({ margem }: { margem: number }) {
  const c = margem >= 40 ? 'text-success' : margem >= 20 ? 'text-warning' : 'text-destructive';
  return <span className={`font-mono text-sm ${c}`}>{margem.toFixed(1)}%</span>;
}
