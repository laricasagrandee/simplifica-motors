import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { AlertTriangle } from 'lucide-react';
import { CATEGORIAS_PECAS } from '@/lib/constants';
import type { Peca } from '@/types/database';

interface Props {
  pecas: Peca[];
  onVer: (id: string) => void;
}

export function PecaListMobile({ pecas, onVer }: Props) {
  return (
    <div className="space-y-3">
      {pecas.map((p) => {
        const emAlerta = p.estoque_atual <= p.estoque_minimo;
        return (
          <button
            key={p.id}
            onClick={() => onVer(p.id)}
            className="w-full bg-card border border-border rounded-xl p-4 text-left card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.nome}</p>
                {p.codigo && <p className="text-xs font-mono text-muted-foreground mt-0.5">{p.codigo}</p>}
                <Badge variant="secondary" className="bg-accent-light text-accent text-[10px] mt-1">{CATEGORIAS_PECAS[p.categoria]}</Badge>
              </div>
              <div className="text-right shrink-0 ml-3">
                <MoneyDisplay valor={p.preco_venda} className="text-sm" />
                <p className={`text-xs font-mono mt-1 ${emAlerta ? 'text-danger font-bold' : 'text-muted-foreground'}`}>
                  {emAlerta && <AlertTriangle className="h-3 w-3 inline mr-0.5 -mt-0.5" />}
                  Est: {p.estoque_atual}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
