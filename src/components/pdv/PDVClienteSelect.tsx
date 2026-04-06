import { useState } from 'react';
import { Search, User, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useListarClientes, useCriarCliente } from '@/hooks/useClientes';
import { toast } from 'sonner';

interface Props {
  clienteId: string | null;
  onChange: (id: string | null) => void;
}

export function PDVClienteSelect({ clienteId, onChange }: Props) {
  const [busca, setBusca] = useState('');
  const [cadastrando, setCadastrando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const { data } = useListarClientes(busca, 1);
  const clientes = data?.data ?? [];
  const selecionado = clientes.find((c) => c.id === clienteId);
  const criarCliente = useCriarCliente();

  const handleCadastrar = async () => {
    if (!novoNome.trim()) return;
    try {
      const c = await criarCliente.mutateAsync({ nome: novoNome.trim(), cpf_cnpj: null, telefone: null, email: null, data_nascimento: null, cep: null, rua: null, numero: null, bairro: null, cidade: null, estado: null });
      onChange((c as any).id);
      setCadastrando(false);
      setNovoNome('');
      setBusca('');
      toast.success('Cliente cadastrado!');
    } catch {
      toast.error('Erro ao cadastrar');
    }
  };

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

  if (cadastrando) {
    return (
      <div>
        <Label>Cadastrar Cliente</Label>
        <div className="space-y-2 mt-1">
          <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do cliente" className="min-h-[44px]" autoFocus />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCadastrando(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleCadastrar} disabled={criarCliente.isPending || !novoNome.trim()}>
              {criarCliente.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
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
      {busca.trim().length > 1 && clientes.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">Nenhum cliente encontrado.</p>
      )}
      <button onClick={() => setCadastrando(true)} className="text-sm text-accent font-medium hover:underline flex items-center gap-1 mt-2">
        <Plus className="h-3.5 w-3.5" /> Cadastrar cliente
      </button>
    </div>
  );
}
