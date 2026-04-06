import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  entradas: number;
  saidas: number;
  saldo: number;
  loading: boolean;
}

const cards = [
  { key: 'entradas', label: 'Entradas', icon: TrendingUp, color: 'text-success' },
  { key: 'saidas', label: 'Saídas', icon: TrendingDown, color: 'text-danger' },
  { key: 'saldo', label: 'Saldo', icon: Wallet, color: '' },
] as const;

export function FinanceiroResumoCards({ entradas, saidas, saldo, loading }: Props) {
  const valores = { entradas, saidas, saldo };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(c => (
        <Card key={c.key}>
          <CardContent className="p-4 flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <div className={`rounded-lg p-2 bg-muted ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <MoneyDisplay
                    valor={valores[c.key]}
                    className={`text-lg ${c.key === 'saldo' ? (saldo >= 0 ? 'text-accent' : 'text-destructive') : c.color}`}
                  />
                  <p className="text-xs text-muted-foreground">no período</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
