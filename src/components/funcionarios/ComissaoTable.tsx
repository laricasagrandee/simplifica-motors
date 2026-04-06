import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Wallet } from 'lucide-react';

interface Comissao { id: string; nome: string; osConcluidas: number; maoObra: number; comissaoPct: number; comissao: number; }
interface Props { comissoes: Comissao[]; loading: boolean; onRegistrar: (nome: string, valor: number) => void; }

export function ComissaoTable({ comissoes, loading, onRegistrar }: Props) {
  if (loading) return <LoadingState />;
  if (!comissoes.length) return <EmptyState icon={Wallet} titulo="Sem comissões" descricao="Nenhum mecânico com OS no período." />;

  const total = comissoes.reduce((s, c) => s + c.comissao, 0);

  return (
    <div className="space-y-3">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">Mecânico</th><th className="p-2 text-right">OS</th><th className="p-2 text-right">Mão de Obra</th>
            <th className="p-2 text-right">%</th><th className="p-2 text-right">Comissão</th><th className="p-2"></th>
          </tr></thead>
          <tbody>
            {comissoes.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-2 font-medium flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-bold text-accent">{c.nome.slice(0, 2).toUpperCase()}</div>
                  {c.nome}
                </td>
                <td className="p-2 text-right font-mono">{c.osConcluidas}</td>
                <td className="p-2 text-right"><MoneyDisplay valor={c.maoObra} /></td>
                <td className="p-2 text-right font-mono">{c.comissaoPct}%</td>
                <td className="p-2 text-right"><MoneyDisplay valor={c.comissao} className="text-accent font-bold" /></td>
                <td className="p-2"><Button size="sm" variant="outline" onClick={() => onRegistrar(c.nome, c.comissao)} className="text-xs">Pagar</Button></td>
              </tr>
            ))}
            <tr className="font-bold"><td colSpan={4} className="p-2 text-right">Total</td><td className="p-2 text-right"><MoneyDisplay valor={total} className="text-accent" /></td><td /></tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {comissoes.map(c => (
          <div key={c.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-bold text-accent">{c.nome.slice(0, 2).toUpperCase()}</div>
              <span className="font-medium text-sm">{c.nome}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div><p className="text-muted-foreground">OS</p><p className="font-mono">{c.osConcluidas}</p></div>
              <div><p className="text-muted-foreground">M.Obra</p><MoneyDisplay valor={c.maoObra} className="text-xs" /></div>
              <div><p className="text-muted-foreground">Comissão</p><MoneyDisplay valor={c.comissao} className="text-xs text-accent font-bold" /></div>
            </div>
            <Button size="sm" variant="outline" className="w-full min-h-[44px]" onClick={() => onRegistrar(c.nome, c.comissao)}>Registrar Pagamento</Button>
          </div>
        ))}
        <div className="text-right font-bold text-sm p-2">Total: <MoneyDisplay valor={total} className="text-accent" /></div>
      </div>
    </div>
  );
}
