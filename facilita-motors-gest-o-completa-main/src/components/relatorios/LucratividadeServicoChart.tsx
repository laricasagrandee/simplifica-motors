import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';
import { useLucratividadePorServico } from '@/hooks/useRelatorioAvancado';

interface Props { periodo: { dataInicio: string; dataFim: string }; }

export function LucratividadeServicoChart({ periodo }: Props) {
  const { data, isLoading } = useLucratividadePorServico(periodo);
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data?.length) return null;

  const top10 = data.slice(0, 10).map((d) => ({
    ...d,
    label: d.descricao.length > 25 ? d.descricao.slice(0, 22) + '...' : d.descricao,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top 10 Serviços por Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={130} />
            <Tooltip
              formatter={(v: number) => formatarMoeda(v)}
              labelFormatter={(l) => String(l)}
            />
            <Bar dataKey="receita" name="Receita" fill="hsl(30, 42%, 59%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
