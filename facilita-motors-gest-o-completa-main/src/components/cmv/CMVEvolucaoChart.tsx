import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';

interface DataPoint {
  mes: string;
  faturamento: number;
  cmv: number;
  lucro: number;
}

interface Props {
  data: DataPoint[];
  loading: boolean;
}

export function CMVEvolucaoChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Evolução — Últimos 6 Meses</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Legend />
            <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="hsl(30, 42%, 59%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cmv" name="CMV" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(160, 40%, 30%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
