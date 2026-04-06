import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface DRE {
  receitaBruta: number;
  cmv: number;
  lucroBruto: number;
  despesas: { categoria: string; valor: number }[];
  totalDespesas: number;
  lucroOperacional: number;
  impostos: number;
  lucroLiquido: number;
}

interface Props {
  dre: DRE | undefined;
  loading: boolean;
}

export function DRETabela({ dre, loading }: Props) {
  if (loading || !dre) return <Skeleton className="h-80 w-full" />;

  const negativo = dre.lucroLiquido < 0;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-1 text-sm">
        <Row label="Receita Bruta" valor={dre.receitaBruta} bold />
        <Row label="(-) CMV" valor={-dre.cmv} className="text-destructive" />
        <Separator className="my-2" />
        <Row label="= Lucro Bruto" valor={dre.lucroBruto} bold className="text-success" />
        <Separator className="my-2" />

        <p className="text-xs text-muted-foreground font-semibold mt-3 mb-1">Despesas Operacionais</p>
        {dre.despesas.map(d => (
          <Row key={d.categoria} label={`  (-) ${d.categoria}`} valor={-d.valor} className="text-muted-foreground" />
        ))}
        <Row label="(-) Total Despesas" valor={-dre.totalDespesas} className="text-destructive" />
        <Separator className="my-2" />
        <Row label="= Lucro Operacional" valor={dre.lucroOperacional} bold />
        <Row label="(-) Impostos estimados (~6%)" valor={-dre.impostos} className="text-muted-foreground" />
        <Separator className="my-2" />

        <div className={`rounded-lg p-4 mt-2 ${negativo ? 'bg-danger-light' : 'bg-accent-light'}`}>
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-lg">LUCRO LÍQUIDO</span>
            <MoneyDisplay valor={dre.lucroLiquido} className={`font-display text-xl font-bold ${negativo ? 'text-destructive' : 'text-accent'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, valor, bold, className = '' }: { label: string; valor: number; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between items-center py-0.5 ${className}`}>
      <span className={bold ? 'font-semibold' : ''}>{label}</span>
      <MoneyDisplay valor={Math.abs(valor)} className={`${bold ? 'font-semibold' : ''} ${valor < 0 ? 'text-destructive' : ''}`} />
    </div>
  );
}
