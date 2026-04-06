import { Card, CardContent } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';

interface Props {
  faturamento: number;
  cmv: number;
  lucro: number;
  margem: number;
  loading: boolean;
}

function MargemBadge({ margem }: { margem: number }) {
  const color = margem >= 40 ? 'bg-success-light text-success' : margem >= 20 ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger';
  return <Badge className={`${color} text-lg px-3 py-1`}>{margem.toFixed(1)}%</Badge>;
}

const items = [
  { key: 'faturamento', label: 'Faturamento', icon: DollarSign, color: 'text-accent' },
  { key: 'cmv', label: 'CMV', icon: TrendingDown, color: 'text-warning' },
  { key: 'lucro', label: 'Lucro Bruto', icon: TrendingUp, color: 'text-success' },
] as const;

export function CMVResumoCards({ faturamento, cmv, lucro, margem, loading }: Props) {
  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>;
  const vals = { faturamento, cmv, lucro };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map(c => (
        <Card key={c.key}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <MoneyDisplay valor={vals[c.key]} className={`text-lg ${c.color}`} />
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1"><Percent className="h-4 w-4 text-info" /><span className="text-xs text-muted-foreground">Margem Bruta</span></div>
          <MargemBadge margem={margem} />
        </CardContent>
      </Card>
    </div>
  );
}
