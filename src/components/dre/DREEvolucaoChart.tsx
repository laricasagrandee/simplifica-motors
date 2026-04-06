import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';

interface Props {
  data: { mes: string; lucroLiquido: number }[];
  loading: boolean;
}

export function DREEvolucaoChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Evolução do Lucro Líquido</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 40%, 30%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 40%, 30%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Area type="monotone" dataKey="lucroLiquido" name="Lucro Líquido" stroke="hsl(160, 40%, 30%)" fill="url(#lucroGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
