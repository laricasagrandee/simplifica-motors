import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_OS_CONFIG } from '@/lib/constants';

const COLORS: Record<string, string> = {
  aberta: 'hsl(210, 70%, 55%)', em_orcamento: 'hsl(38, 92%, 50%)', aprovada: 'hsl(30, 42%, 59%)',
  em_execucao: 'hsl(270, 50%, 55%)', concluida: 'hsl(160, 40%, 30%)', entregue: 'hsl(220, 10%, 60%)', cancelada: 'hsl(5, 58%, 50%)',
};

interface Props { data: { status: string; count: number }[]; loading: boolean; }

export function OSPorStatusChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return null;
  const chartData = data.map(d => ({ name: STATUS_OS_CONFIG[d.status as keyof typeof STATUS_OS_CONFIG]?.label || d.status, value: d.count, status: d.status }));

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">OS por Status</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {chartData.map(d => <Cell key={d.status} fill={COLORS[d.status] || '#888'} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
