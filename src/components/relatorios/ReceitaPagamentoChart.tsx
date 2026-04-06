import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/formatters';
import { useReceitaPorFormaPagamento } from '@/hooks/useRelatorioAvancado';

const COLORS = [
  'hsl(30, 42%, 59%)',
  'hsl(200, 60%, 50%)',
  'hsl(150, 50%, 45%)',
  'hsl(340, 55%, 55%)',
  'hsl(260, 45%, 55%)',
  'hsl(45, 70%, 55%)',
];

const LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Débito',
  cartao_credito: 'Crédito',
  boleto: 'Boleto',
};

interface Props { periodo: { dataInicio: string; dataFim: string }; }

export function ReceitaPagamentoChart({ periodo }: Props) {
  const { data, isLoading } = useReceitaPorFormaPagamento(periodo);
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    ...d,
    name: LABELS[d.forma] || d.forma,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Receita por Forma de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="valor"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percentual }) => `${name} ${percentual}%`}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
