import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_OS_CONFIG } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import type { OSStatusCount } from '@/hooks/useDashboardCharts';

const STATUS_COLORS: Record<string, string> = {
  aberta: 'hsl(214, 54%, 50%)',
  em_orcamento: 'hsl(30, 54%, 50%)',
  aprovada: 'hsl(160, 40%, 30%)',
  em_execucao: 'hsl(262, 48%, 53%)',
  concluida: 'hsl(153, 46%, 33%)',
  entregue: 'hsl(220, 16%, 80%)',
  cancelada: 'hsl(5, 58%, 50%)',
};

interface StatusDonutChartProps {
  data: OSStatusCount[];
  loading: boolean;
}

export function StatusDonutChart({ data, loading }: StatusDonutChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_OS_CONFIG[d.status]?.label ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? 'hsl(220, 16%, 80%)',
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-display font-semibold text-sm text-foreground mb-4">OS por Status</h3>
      {loading ? (
        <Skeleton className="h-[200px] w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Nenhuma OS registrada</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {chartData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
