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

export function OSListMobile({ ordens, onVer }: Props) {
  return (
    <div className="space-y-3">
      {ordens.map((os) => {
        const moto = os.motos as unknown as Record<string, string> | undefined;
        const cliente = os.clientes as unknown as Record<string, string> | undefined;
        const Icon = Bike;
        return (
          <button key={os.id} onClick={() => onVer(os.id)} className="w-full bg-card border border-border rounded-xl p-4 text-left card-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-accent font-semibold">{formatarNumeroOS(os.numero)}</span>
              <StatusBadge status={os.status as StatusOS} />
            </div>
            <p className="text-sm font-medium text-foreground">{cliente?.nome ?? '—'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{moto?.marca} {moto?.modelo}</span>
              {moto?.placa && <PlacaBadge placa={moto.placa} />}
            </div>
            <div className="flex items-center justify-between mt-3">
              <MoneyDisplay valor={os.valor_total} className="text-sm" />
              <span className="text-xs text-muted-foreground">{formatarDataCurta(os.criado_em!)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
