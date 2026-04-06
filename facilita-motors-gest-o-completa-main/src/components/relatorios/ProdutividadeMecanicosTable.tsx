import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Medal, Wrench } from 'lucide-react';

interface Mecanico { id: string; nome: string; osFeitas: number; faturamento: number; tempoMedio: number; comissao: number; }
interface Props { mecanicos: Mecanico[]; loading: boolean; }

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

export function ProdutividadeMecanicosTable({ mecanicos, loading }: Props) {
  if (loading) return <LoadingState />;
  if (!mecanicos.length) return <EmptyState icon={Wrench} titulo="Sem dados" descricao="Nenhuma OS de mecânico no período." />;

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">#</th><th className="p-2">Mecânico</th><th className="p-2 text-right">OS</th>
            <th className="p-2 text-right">Faturamento</th><th className="p-2 text-right">Tempo Médio</th><th className="p-2 text-right">Comissão</th>
          </tr></thead>
          <tbody>{mecanicos.map((m, i) => (
            <tr key={m.id} className="border-b hover:bg-muted/50">
              <td className="p-2">{i < 3 ? <Medal className={`h-4 w-4 ${medalColors[i]}`} /> : i + 1}</td>
              <td className="p-2 font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-bold text-accent">{m.nome.slice(0, 2).toUpperCase()}</div>
                {m.nome}
              </td>
              <td className="p-2 text-right font-mono">{m.osFeitas}</td>
              <td className="p-2 text-right"><MoneyDisplay valor={m.faturamento} /></td>
              <td className="p-2 text-right font-mono">{m.tempoMedio.toFixed(1)} dias</td>
              <td className="p-2 text-right"><MoneyDisplay valor={m.comissao} className="text-accent" /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="md:hidden space-y-2">
        {mecanicos.map((m, i) => (
          <div key={m.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              {i < 3 && <Medal className={`h-4 w-4 ${medalColors[i]}`} />}
              <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-bold text-accent">{m.nome.slice(0, 2).toUpperCase()}</div>
              <span className="font-medium text-sm">{m.nome}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">OS</p><p className="font-mono">{m.osFeitas}</p></div>
              <div><p className="text-muted-foreground">Tempo</p><p className="font-mono">{m.tempoMedio.toFixed(1)}d</p></div>
              <div><p className="text-muted-foreground">Comissão</p><MoneyDisplay valor={m.comissao} className="text-xs text-accent" /></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
