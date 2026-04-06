import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Plus, User, Bike, Car } from 'lucide-react';
import { useListarClientes, useCriarCliente } from '@/hooks/useClientes';
import { useVeiculosPorCliente, useCriarVeiculo } from '@/hooks/useVeiculos';
import { useCriarOS } from '@/hooks/useOS';
import { formatarTelefone, formatarNumeroOS } from '@/lib/formatters';
import { toast } from 'sonner';
import type { Cliente, Veiculo, TipoVeiculo } from '@/types/database';

export default function OSRapidaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [problema, setProblema] = useState('');
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [criandoCliente, setCriandoCliente] = useState(false);
  const [novoVeiculoTipo, setNovoVeiculoTipo] = useState<TipoVeiculo>('moto');
  const [criandoVeiculo, setCriandoVeiculo] = useState(false);

  const { data: clientesData, isLoading: buscandoClientes } = useListarClientes(busca, 1);
  const clientes = clientesData?.data ?? [];
  const { data: veiculos } = useVeiculosPorCliente(cliente?.id ?? '');
  const criarOS = useCriarOS();
  const criarCliente = useCriarCliente();
  const criarVeiculo = useCriarVeiculo();

  const handleCriarCliente = async () => {
    if (!novoClienteNome.trim()) return;
    try {
      const c = await criarCliente.mutateAsync({ nome: novoClienteNome.trim(), cpf_cnpj: '', telefone: '' });
      setCliente(c as Cliente);
      setNovoClienteNome('');
      setCriandoCliente(false);
      setBusca('');
    } catch { toast.error('Erro ao criar cliente'); }
  };

  const handleCriarVeiculo = async () => {
    if (!cliente) return;
    try {
      const v = await criarVeiculo.mutateAsync({ clienteId: cliente.id, tipo_veiculo: novoVeiculoTipo, marca: '', modelo: '', placa: '' });
      setVeiculo(v as Veiculo);
      setCriandoVeiculo(false);
    } catch { toast.error('Erro ao criar veículo'); }
  };

  const handleAbrir = async () => {
    if (!cliente || !veiculo) return;
    try {
      const os = await criarOS.mutateAsync({
        clienteId: cliente.id,
        motoId: veiculo.id,
        problemaRelatado: problema,
      });
      toast.success(`${formatarNumeroOS(os.numero)} aberta com sucesso!`);
      navigate(`/os/${os.id}`);
    } catch { toast.error('Erro ao abrir OS'); }
  };

  return (
    <AppLayout>
      <PageHeader titulo="OS Rápida" subtitulo="Abertura expressa em um passo" />
      <div className="max-w-lg mx-auto space-y-6">
        {/* Cliente */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</Label>
          {cliente ? (
            <div className="flex items-center justify-between bg-accent-light border border-accent-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{cliente.nome}</span>
                {cliente.telefone && <span className="text-xs text-muted-foreground">{formatarTelefone(cliente.telefone)}</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setCliente(null); setVeiculo(null); }}>Trocar</Button>
            </div>
          ) : criandoCliente ? (
            <div className="flex gap-2">
              <Input value={novoClienteNome} onChange={(e) => setNovoClienteNome(e.target.value)} placeholder="Nome do cliente" className="min-h-[44px]" />
              <Button onClick={handleCriarCliente} disabled={criarCliente.isPending || !novoClienteNome.trim()}>
                {criarCliente.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
              </Button>
              <Button variant="outline" onClick={() => setCriandoCliente(false)}>×</Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone ou placa..." className="pl-10 min-h-[44px]" />
              </div>
              {busca.trim() && !buscandoClientes && (
                <div className="bg-card border border-border rounded-lg max-h-40 overflow-y-auto divide-y divide-border">
                  {clientes.map((c) => (
                    <button key={c.id} onClick={() => { setCliente(c); setBusca(''); }} className="w-full flex items-center gap-2 p-3 hover:bg-muted/30 text-left min-h-[44px]">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{c.nome}</span>
                      {c.telefone && <span className="text-xs text-muted-foreground">{formatarTelefone(c.telefone)}</span>}
                    </button>
                  ))}
                  {clientes.length === 0 && <p className="p-3 text-sm text-muted-foreground text-center">Nenhum encontrado</p>}
                </div>
              )}
              <button onClick={() => setCriandoCliente(true)} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Novo Cliente
              </button>
            </>
          )}
        </div>

        {/* Veículo */}
        {cliente && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veículo</Label>
            {veiculo ? (
              <div className="flex items-center justify-between bg-accent-light border border-accent-border rounded-lg p-3">
                <span className="text-sm font-medium">{[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' ') || (veiculo.tipo_veiculo === 'carro' ? 'Carro' : 'Moto')}</span>
                <Button variant="ghost" size="sm" onClick={() => setVeiculo(null)}>Trocar</Button>
              </div>
            ) : criandoVeiculo ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(['moto', 'carro'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setNovoVeiculoTipo(t)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium min-h-[44px] ${
                        novoVeiculoTipo === t ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground'
                      }`}>
                      {t === 'moto' ? <Bike className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                      {t === 'moto' ? 'Moto' : 'Carro'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCriarVeiculo} disabled={criarVeiculo.isPending}>
                    {criarVeiculo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Veículo'}
                  </Button>
                  <Button variant="outline" onClick={() => setCriandoVeiculo(false)}>×</Button>
                </div>
              </div>
            ) : (
              <>
                {veiculos && veiculos.length > 0 ? (
                  <div className="space-y-1">
                    {veiculos.map((v) => (
                      <button key={v.id} onClick={() => setVeiculo(v)} className="w-full flex items-center gap-2 p-3 bg-card border border-border rounded-lg hover:bg-muted/30 text-left min-h-[44px]">
                        <span className="text-sm font-medium">{[v.marca, v.modelo].filter(Boolean).join(' ') || (v.tipo_veiculo === 'carro' ? 'Carro' : 'Moto')}</span>
                        {v.placa && <span className="text-xs font-mono text-muted-foreground">{v.placa}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
                )}
                <button onClick={() => setCriandoVeiculo(true)} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Novo Veículo
                </button>
              </>
            )}
          </div>
        )}

        {/* Problema */}
        {cliente && veiculo && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problema (opcional)</Label>
            <Textarea value={problema} onChange={(e) => setProblema(e.target.value)} placeholder="Descreva o problema se houver..." maxLength={2000} className="min-h-[80px]" />
          </div>
        )}

        {/* Botão */}
        <Button onClick={handleAbrir} disabled={!cliente || !veiculo || criarOS.isPending} className="w-full min-h-[48px] text-base">
          {criarOS.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Abrir OS'}
        </Button>
      </div>
    </AppLayout>
  );
}