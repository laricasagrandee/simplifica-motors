import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCriarAgendamento } from '@/hooks/useAgendamentos';

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

  useEffect(() => {
    if (!open) return;
    supabase.from('clientes').select('id, nome').order('nome').then(({ data }) => setClientes(data ?? []));
    supabase.from('funcionarios').select('id, nome').eq('cargo', 'mecanico').eq('ativo', true).then(({ data }) => setMecanicos(data ?? []));
  }, [open]);

  useEffect(() => {
    if (!clienteId) { setVeiculos([]); setVeiculoId(''); return; }
    supabase.from('motos').select('id, placa, modelo').eq('cliente_id', clienteId).then(({ data }) => setVeiculos(data ?? []));
  }, [clienteId]);

  const handleSave = () => {
    if (!clienteId || !veiculoId || !descricao || !data) return;
    criar.mutate(
      {
        cliente_id: clienteId,
        veiculo_id: veiculoId,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Veículo</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId} disabled={!clienteId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{v.placa} — {v.modelo}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição do serviço</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <Label>Hora</Label>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duração</Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DURACOES.map((d) => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mecânico</Label>
              <Select value={mecanicoId} onValueChange={setMecanicoId}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>{mecanicos.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} disabled={criar.isPending || !clienteId || !veiculoId || !descricao || !data} className="w-full">
            {criar.isPending ? 'Salvando...' : 'Salvar Agendamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
