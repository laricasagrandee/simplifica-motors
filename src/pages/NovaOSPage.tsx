import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { NovaOSProgress } from '@/components/os/nova/NovaOSProgress';
import { NovaOSCliente } from '@/components/os/nova/NovaOSCliente';
import { NovaOSVeiculo } from '@/components/os/nova/NovaOSVeiculo';
import { NovaOSProblema } from '@/components/os/nova/NovaOSProblema';
import { NovaOSFotos } from '@/components/os/nova/NovaOSFotos';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { VeiculoForm } from '@/components/clientes/veiculos/VeiculoForm';
import { useCriarOS } from '@/hooks/useOS';
import { useCriarCliente } from '@/hooks/useClientes';
import { useCriarVeiculo } from '@/hooks/useVeiculos';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatarNumeroOS } from '@/lib/formatters';
import type { Cliente, Veiculo } from '@/types/database';

export default function NovaOSPage() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [km, setKm] = useState('');
  const [problema, setProblema] = useState({ problemaRelatado: '', funcionarioId: '', observacoes: '' });
  const [fotos, setFotos] = useState<File[]>([]);
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [veiculoFormOpen, setVeiculoFormOpen] = useState(false);

  const criarOS = useCriarOS();
  const criarCliente = useCriarCliente();
  const criarVeiculo = useCriarVeiculo();

  const handleAbrir = async () => {
    if (!cliente || !veiculo) return;
    try {
      const os = await criarOS.mutateAsync({
        clienteId: cliente.id, motoId: veiculo.id,
        problemaRelatado: problema.problemaRelatado,
        funcionarioId: problema.funcionarioId || undefined,
        observacoes: problema.observacoes,
        quilometragem: km ? Number(km) : undefined,
      });

      // Upload photos
      for (const foto of fotos) {
        const path = `${os.id}/entrada/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage.from('os-fotos').upload(path, foto);
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('os-fotos').getPublicUrl(path);
          await supabase.from('os_fotos').insert({ os_id: os.id, tipo: 'entrada', url: urlData.publicUrl });
        }
      }

      toast.success(`${formatarNumeroOS(os.numero)} aberta com sucesso!`);
      navigate(`/os/${os.id}`);
    } catch {
      toast.error('Erro ao abrir OS');
    }
  };

  return (
    <AppLayout>
      <PageHeader titulo="Nova Ordem de Serviço" />
      <NovaOSProgress etapaAtual={etapa} />
      <div className="max-w-2xl mx-auto">
        {etapa === 1 && <NovaOSCliente clienteSelecionado={cliente} onSelecionar={setCliente} onNovoCliente={() => setClienteFormOpen(true)} onProximo={() => setEtapa(2)} />}
        {etapa === 2 && cliente && <NovaOSVeiculo clienteId={cliente.id} veiculoSelecionado={veiculo} quilometragem={km} onSelecionar={setVeiculo} onQuilometragemChange={setKm} onNovoVeiculo={() => setVeiculoFormOpen(true)} onVoltar={() => setEtapa(1)} onProximo={() => setEtapa(3)} />}
        {etapa === 3 && <NovaOSProblema dados={problema} onChange={(d) => setProblema((p) => ({ ...p, ...d }))} onVoltar={() => setEtapa(2)} onProximo={() => setEtapa(4)} />}
        {etapa === 4 && <NovaOSFotos fotos={fotos} onAdicionarFoto={(f) => setFotos((p) => [...p, f])} onRemoverFoto={(i) => setFotos((p) => p.filter((_, idx) => idx !== i))} onVoltar={() => setEtapa(3)} onAbrir={handleAbrir} loading={criarOS.isPending} />}
      </div>
      <ClienteForm open={clienteFormOpen} onClose={() => setClienteFormOpen(false)} onSalvar={async (d) => { const c = await criarCliente.mutateAsync(d); setCliente(c as Cliente); }} loading={criarCliente.isPending} />
      {cliente && <VeiculoForm open={veiculoFormOpen} onClose={() => setVeiculoFormOpen(false)} clienteId={cliente.id} onSalvar={async (d) => { const v = await criarVeiculo.mutateAsync(d as Parameters<typeof criarVeiculo.mutateAsync>[0]); setVeiculo(v as Veiculo); }} loading={criarVeiculo.isPending} />}
    </AppLayout>
  );
}
