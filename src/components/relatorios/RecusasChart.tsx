import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { useRecusasPeriodo } from '@/hooks/useRelatorioRecusas';
import { formatarMoeda } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ThumbsDown } from 'lucide-react';

interface Props {
  periodo: { dataInicio: string; dataFim: string };
}

export function RecusasChart({ periodo }: Props) {
  const { data, isLoading } = useRecusasPeriodo(periodo);

  if (isLoading) return <LoadingState variant="card" />;
  if (!data || data.total === 0) return <EmptyState icon={ThumbsDown} titulo="Nenhuma recusa no período" descricao="Nenhum orçamento foi recusado neste período." />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg flex items-center justify-between">
          <span>Orçamentos Recusados ({data.total})</span>
          <MoneyDisplay valor={data.totalRecusado} className="text-destructive font-bold" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.porMotivo.length * 48)}>
          <BarChart data={data.porMotivo} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" tickFormatter={(v) => formatarMoeda(v)} fontSize={11} />
            <YAxis type="category" dataKey="motivo" width={150} fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip
              formatter={(v: number) => formatarMoeda(v)}
              labelFormatter={(l) => `${l}`}
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
            />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.porMotivo.map((_, i) => (
                <Cell key={i} fill={`hsl(var(--destructive))`} opacity={0.7 + (0.3 * (1 - i / Math.max(data.porMotivo.length, 1)))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          {data.porMotivo.map((m) => (
            <div key={m.motivo} className="flex justify-between border rounded-lg px-2 py-1">
              <span className="truncate">{m.motivo}</span>
              <span className="font-medium ml-1">{m.count}x</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
