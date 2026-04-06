import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { formatarDataCurta, formatarNumeroOS } from '@/lib/formatters';
import { Bike, Car } from 'lucide-react';
import type { OrdemServico, StatusOS } from '@/types/database';

interface Props {
  ordens: OrdemServico[];
  onVer: (id: string) => void;
}

export function OSListDesktop({ ordens, onVer }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left px-4 py-3 font-semibold">Nº OS</th>
            <th className="text-left px-4 py-3 font-semibold">Cliente</th>
            <th className="text-left px-4 py-3 font-semibold">Veículo</th>
            <th className="text-left px-4 py-3 font-semibold">Mecânico</th>
            <th className="text-left px-4 py-3 font-semibold">Status</th>
            <th className="text-right px-4 py-3 font-semibold">Valor</th>
            <th className="text-right px-4 py-3 font-semibold">Data</th>
          </tr>
        </thead>
        <tbody>
          {ordens.map((os) => {
            const moto = os.motos as unknown as Record<string, string> | undefined;
            const cliente = os.clientes as unknown as Record<string, string> | undefined;
            const func = os.funcionarios as unknown as Record<string, string> | undefined;
            const Icon = Bike;
            return (
              <tr key={os.id} onClick={() => onVer(os.id)} className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-mono text-sm text-accent font-semibold">{formatarNumeroOS(os.numero)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{cliente?.nome ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{moto?.marca} {moto?.modelo}</span>
                    {moto?.placa && <PlacaBadge placa={moto.placa} />}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{func?.nome ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={os.status as StatusOS} /></td>
                <td className="px-4 py-3 text-right"><MoneyDisplay valor={os.valor_total} className="text-sm" /></td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatarDataCurta(os.criado_em!)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
