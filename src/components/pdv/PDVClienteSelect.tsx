import { useState } from 'react';
import { Search, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useListarClientes } from '@/hooks/useClientes';

interface Props {
  clienteId: string | null;
  onChange: (id: string | null) => void;
}

export function PDVClienteSelect({ clienteId, onChange }: Props) {
  const [busca, setBusca] = useState('');
  const { data } = useListarClientes(busca, 1);
  const clientes = data?.data ?? [];
  const selecionado = clientes.find((c) => c.id === clienteId);

  if (clienteId && selecionado) {
    return (
      <div>
        <Label>Cliente</Label>
        <div className="flex items-center gap-2 border border-border rounded-md p-2.5 mt-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">{selecionado.nome}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { onChange(null); setBusca(''); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>Cliente (opcional)</Label>
      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente..."
          className="pl-9 h-11"
        />
      </div>
      {busca.trim().length > 1 && clientes.length > 0 && (
        <div className="border border-border rounded-md mt-1 max-h-32 overflow-y-auto">
          {clientes.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => { onChange(c.id); setBusca(''); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition"
            >
              {c.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
