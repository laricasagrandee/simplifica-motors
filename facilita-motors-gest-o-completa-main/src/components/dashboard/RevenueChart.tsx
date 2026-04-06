import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatarMoeda } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import type { FaturamentoDia } from '@/hooks/useDashboardCharts';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface RevenueChartProps {
  data: FaturamentoDia[];
  loading: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    dia: DIAS_SEMANA[new Date(d.data + 'T12:00:00').getDay()],
    valor: d.valor,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-display font-semibold text-sm text-foreground mb-4">
        Faturamento — Últimos 7 dias
      </h3>
      {loading ? (
        <Skeleton className="h-[240px] w-full rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 24%, 92%)" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Bar dataKey="valor" fill="hsl(160, 40%, 30%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
