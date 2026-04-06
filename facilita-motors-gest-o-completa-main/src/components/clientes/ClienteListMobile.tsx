import { ClienteCard } from './ClienteCard';
import type { Cliente } from '@/types/database';

interface Props {
  clientes: (Cliente & { motos_count: number })[];
  onEditar: (c: Cliente) => void;
  onVer: (id: string) => void;
  onExcluir: (c: Cliente) => void;
}

export function ClienteListMobile({ clientes, onEditar, onVer, onExcluir }: Props) {
  return (
    <div className="space-y-3">
      {clientes.map((c) => (
        <div key={c.id} onClick={() => onVer(c.id)} className="cursor-pointer">
          <ClienteCard
            cliente={c}
            onEditar={() => { onEditar(c); }}
            onExcluir={() => { onExcluir(c); }}
          />
        </div>
      ))}
    </div>
  );
}
