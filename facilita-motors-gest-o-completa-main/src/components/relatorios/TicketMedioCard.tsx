import { Card, CardContent } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from 'lucide-react';

interface Props { valor: number; count: number; loading: boolean; }

export function TicketMedioCard({ valor, count, loading }: Props) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-lg p-2 bg-muted text-accent"><Receipt className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
          <MoneyDisplay valor={valor} className="text-lg text-accent" />
          <p className="text-xs text-muted-foreground">{count} OS no período</p>
        </div>
      </CardContent>
    </Card>
  );
}
