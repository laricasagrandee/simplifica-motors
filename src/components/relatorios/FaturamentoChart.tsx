import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';

interface Props { data: { data: string; valor: number }[]; loading: boolean; }

export function FaturamentoChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return null;
  const formatted = data.map(d => ({ ...d, label: d.data.slice(5).replace('-', '/') }));
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Faturamento por Dia</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Bar dataKey="valor" name="Faturamento" fill="hsl(30, 42%, 59%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
