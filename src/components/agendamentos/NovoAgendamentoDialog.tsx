import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCriarAgendamento } from '@/hooks/useAgendamentos';
import { useCriarCliente } from '@/hooks/useClientes';
import { useCriarVeiculo } from '@/hooks/useVeiculos';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DURACOES = [
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '2 horas', value: 120 },
  { label: '3 horas', value: 180 },
  { label: '4 horas', value: 240 },
];

export function NovoAgendamentoDialog({ open, onClose }: Props) {
  const criar = useCriarAgendamento();
  const criarCliente = useCriarCliente();
  const criarVeiculo = useCriarVeiculo();

  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [veiculos, setVeiculos] = useState<{ id: string; placa: string; modelo: string }[]>([]);
  const [mecanicos, setMecanicos] = useState<{ id: string; nome: string }[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('08:00');
  const [duracao, setDuracao] = useState('60');

  // Inline new client
  const [novoClienteMode, setNovoClienteMode] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  // Inline new vehicle
  const [novoVeiculoMode, setNovoVeiculoMode] = useState(false);
  const [novoVeiculoTipo, setNovoVeiculoTipo] = useState<'moto' | 'carro'>('moto');

  useEffect(() => {
    if (!open) return;
    supabase.from('clientes').select('id, nome').order('nome').then(({ data }) => setClientes(data ?? []));
    supabase.from('funcionarios').select('id, nome').eq('cargo', 'mecanico').eq('ativo', true).then(({ data }) => setMecanicos(data ?? []));
  }, [open]);

  useEffect(() => {
    if (!clienteId) { setVeiculos([]); setVeiculoId(''); return; }
    supabase.from('motos').select('id, placa, modelo').eq('cliente_id', clienteId).then(({ data }) => setVeiculos(data ?? []));
  }, [clienteId]);

  const handleNovoCliente = async () => {
    if (!novoClienteNome.trim()) return;
    try {
      const c = await criarCliente.mutateAsync({ nome: novoClienteNome.trim(), cpf_cnpj: null, telefone: null, email: null, data_nascimento: null, cep: null, rua: null, numero: null, bairro: null, cidade: null, estado: null });
      const newId = (c as any).id;
      setClientes(prev => [...prev, { id: newId, nome: novoClienteNome.trim() }]);
      setClienteId(newId);
      setNovoClienteMode(false);
      setNovoClienteNome('');
      toast.success('Cliente cadastrado!');
    } catch { toast.error('Erro ao cadastrar'); }
  };

  const handleNovoVeiculo = async () => {
    if (!clienteId) return;
    try {
      const v = await criarVeiculo.mutateAsync({ clienteId: clienteId, tipo_veiculo: novoVeiculoTipo, marca: '', modelo: '', placa: null, ano: null, cor: null, quilometragem: null } as any);
      const newId = (v as any).id;
      setVeiculos(prev => [...prev, { id: newId, placa: '', modelo: novoVeiculoTipo === 'moto' ? 'Moto' : 'Carro' }]);
      setVeiculoId(newId);
      setNovoVeiculoMode(false);
      toast.success('Veículo cadastrado!');
    } catch { toast.error('Erro ao cadastrar'); }
  };

  const handleSave = () => {
    if (!descricao.trim() || !data) return;
    criar.mutate(
      {
        cliente_id: clienteId || undefined as any,
        veiculo_id: veiculoId || undefined as any,
        descricao,
        data_hora: `${data}T${hora}:00`,
        duracao_minutos: Number(duracao),
        mecanico_id: mecanicoId || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setClienteId(''); setVeiculoId(''); setDescricao(''); setData(''); setHora('08:00'); setDuracao('60'); setMecanicoId('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Data e Hora - obrigatórios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data *</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Hora *</Label>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-[44px]" />
            </div>
          </div>

          {/* Descrição - obrigatório */}
          <div>
            <Label>Descrição do serviço *</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} placeholder="Ex: Revisão, Troca de óleo..." />
          </div>

          {/* Cliente - opcional */}
          <div>
            <Label>Cliente (opcional)</Label>
            {novoClienteMode ? (
              <div className="space-y-2 mt-1">
                <Input value={novoClienteNome} onChange={(e) => setNovoClienteNome(e.target.value)} placeholder="Nome do cliente" className="min-h-[44px]" autoFocus />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setNovoClienteMode(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleNovoCliente} disabled={criarCliente.isPending || !novoClienteNome.trim()}>
                    {criarCliente.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="min-h-[44px]"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                  <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
                <button onClick={() => setNovoClienteMode(true)} className="text-xs text-accent font-medium hover:underline flex items-center gap-1 mt-1">
                  <Plus className="h-3 w-3" /> Novo Cliente
                </button>
              </>
            )}
          </div>

          {/* Veículo - opcional */}
          <div>
            <Label>Veículo (opcional)</Label>
            {novoVeiculoMode && clienteId ? (
              <div className="space-y-2 mt-1">
                <div className="flex gap-2">
                  {(['moto', 'carro'] as const).map(t => (
                    <Button key={t} type="button" variant={novoVeiculoTipo === t ? 'default' : 'outline'} size="sm" onClick={() => setNovoVeiculoTipo(t)}>
                      {t === 'moto' ? 'Moto' : 'Carro'}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setNovoVeiculoMode(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleNovoVeiculo} disabled={criarVeiculo.isPending}>
                    {criarVeiculo.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Select value={veiculoId} onValueChange={setVeiculoId} disabled={!clienteId}>
                  <SelectTrigger className="min-h-[44px]"><SelectValue placeholder={clienteId ? 'Selecione (opcional)' : 'Selecione um cliente primeiro'} /></SelectTrigger>
                  <SelectContent>{veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{[v.placa, v.modelo].filter(Boolean).join(' — ') || 'Veículo'}</SelectItem>)}</SelectContent>
                </Select>
                {clienteId && (
                  <button onClick={() => setNovoVeiculoMode(true)} className="text-xs text-accent font-medium hover:underline flex items-center gap-1 mt-1">
                    <Plus className="h-3 w-3" /> Novo Veículo
                  </button>
                )}
              </>
            )}
          </div>

          {/* Duração e Mecânico - opcionais */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duração (opcional)</Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>{DURACOES.map((d) => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mecânico (opcional)</Label>
              <Select value={mecanicoId} onValueChange={setMecanicoId}>
                <SelectTrigger className="min-h-[44px]"><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>{mecanicos.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={criar.isPending || !descricao.trim() || !data} className="w-full min-h-[44px]">
            {criar.isPending ? 'Salvando...' : 'Salvar Agendamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
