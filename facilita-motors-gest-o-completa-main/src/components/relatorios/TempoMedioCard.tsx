import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ArrowUp, ArrowDown, Hash } from 'lucide-react';
import { useTempoMedioOS } from '@/hooks/useRelatorioAvancado';

interface Props { periodo: { dataInicio: string; dataFim: string }; }

export function TempoMedioCard({ periodo }: Props) {
  const { data, isLoading } = useTempoMedioOS(periodo);
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!data || data.total === 0) return null;

  const items = [
    { icon: Clock, label: 'Tempo Médio', value: `${data.tempoMedio} dias` },
    { icon: ArrowUp, label: 'Maior', value: `${data.maiorTempo} dias` },
    { icon: ArrowDown, label: 'Menor', value: `${data.menorTempo} dias` },
    { icon: Hash, label: 'OS Concluídas', value: String(data.total) },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tempo Médio de OS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2">
              <it.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{it.label}</p>
                <p className="text-sm font-semibold">{it.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
