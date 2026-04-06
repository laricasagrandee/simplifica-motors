import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Phone, User } from 'lucide-react';
import { useListarClientes } from '@/hooks/useClientes';
import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import type { Cliente } from '@/types/database';

interface Props {
  clienteSelecionado: Cliente | null;
  onSelecionar: (c: Cliente) => void;
  onNovoCliente: () => void;
  onProximo: () => void;
}

export function NovaOSCliente({ clienteSelecionado, onSelecionar, onNovoCliente, onProximo }: Props) {
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useListarClientes(busca, 1);
  const clientes = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">Selecione o Cliente</h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone ou placa..." className="pl-10 min-h-[44px]" />
      </div>

      {clienteSelecionado && (
        <div className="bg-accent-light border border-accent-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center">
              {clienteSelecionado.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{clienteSelecionado.nome}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {clienteSelecionado.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{formatarTelefone(clienteSelecionado.telefone)}</span>}
                {clienteSelecionado.cpf_cnpj && <span className="font-mono">{clienteSelecionado.cpf_cnpj.length > 11 ? formatarCNPJ(clienteSelecionado.cpf_cnpj) : formatarCPF(clienteSelecionado.cpf_cnpj)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {busca.trim() && !isLoading && (
        <div className="bg-card border border-border rounded-xl max-h-60 overflow-y-auto divide-y divide-border">
          {clientes.map((c) => (
            <button key={c.id} onClick={() => { onSelecionar(c); setBusca(''); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 text-left min-h-[44px]">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{c.nome}</p>
                {c.telefone && <p className="text-xs text-muted-foreground">{formatarTelefone(c.telefone)}</p>}
              </div>
            </button>
          ))}
          {clientes.length === 0 && <p className="p-3 text-sm text-muted-foreground text-center">Nenhum cliente encontrado.</p>}
        </div>
      )}

      <button onClick={onNovoCliente} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
        <Plus className="h-3.5 w-3.5" /> Novo Cliente
      </button>

      <div className="flex justify-end pt-4">
        <Button onClick={onProximo} disabled={!clienteSelecionado}>Próximo →</Button>
      </div>
    </div>
  );
}
