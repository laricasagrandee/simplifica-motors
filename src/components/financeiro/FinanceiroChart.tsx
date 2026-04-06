import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';

interface DataPoint {
  data: string;
  entradas: number;
  saidas: number;
}

interface Props {
  data: DataPoint[];
  loading: boolean;
}

export function FinanceiroChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return null;

  const formatted = data.map(d => ({
    ...d,
    label: d.data.slice(5).replace('-', '/'),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Legend />
            <Bar dataKey="entradas" name="Entradas" fill="hsl(160, 40%, 30%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saidas" name="Saídas" fill="hsl(5, 58%, 50%)" opacity={0.7} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
