import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DRE {
  receitaBruta: number;
  cmv: number;
  lucroBruto: number;
  totalDespesas: number;
  lucroOperacional: number;
  impostos: number;
  lucroLiquido: number;
}

interface Props {
  dreAtual: DRE | undefined;
  dreAnterior: DRE | undefined;
  loading: boolean;
}

function variacao(atual: number, anterior: number) {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function VarBadge({ v, inverted }: { v: number; inverted?: boolean }) {
  const positivo = inverted ? v < 0 : v > 0;
  return (
    <Badge variant="outline" className={`text-xs gap-0.5 ${positivo ? 'text-success' : 'text-destructive'}`}>
      {positivo ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(v).toFixed(1)}%
    </Badge>
  );
}

const linhas: { key: keyof DRE; label: string; inverted?: boolean }[] = [
  { key: 'receitaBruta', label: 'Receita Bruta' },
  { key: 'cmv', label: 'CMV', inverted: true },
  { key: 'lucroBruto', label: 'Lucro Bruto' },
  { key: 'totalDespesas', label: 'Despesas', inverted: true },
  { key: 'lucroOperacional', label: 'Lucro Operacional' },
  { key: 'impostos', label: 'Impostos', inverted: true },
  { key: 'lucroLiquido', label: 'Lucro Líquido' },
];

export function DREComparativo({ dreAtual, dreAnterior, loading }: Props) {
  if (loading || !dreAtual || !dreAnterior) return <Skeleton className="h-60 w-full" />;

  return (
    <Card>
      <CardContent className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-muted-foreground text-left">
            <th className="p-2">Item</th><th className="p-2 text-right">Atual</th>
            <th className="p-2 text-right">Anterior</th><th className="p-2 text-right">Variação</th>
          </tr></thead>
          <tbody>
            {linhas.map(l => {
              const va = dreAtual[l.key] as number;
              const vb = dreAnterior[l.key] as number;
              const v = variacao(va, vb);
              const bold = ['lucroBruto', 'lucroOperacional', 'lucroLiquido'].includes(l.key);
              return (
                <tr key={l.key} className="border-b">
                  <td className={`p-2 ${bold ? 'font-semibold' : ''}`}>{l.label}</td>
                  <td className="p-2 text-right"><MoneyDisplay valor={va} /></td>
                  <td className="p-2 text-right"><MoneyDisplay valor={vb} className="text-muted-foreground" /></td>
                  <td className="p-2 text-right"><VarBadge v={v} inverted={l.inverted} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
