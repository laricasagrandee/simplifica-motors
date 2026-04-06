import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ClientePagination } from '@/components/clientes/ClientePagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { VeiculoCard } from '@/components/veiculos/VeiculoCard';
import { VeiculoForm } from '@/components/clientes/veiculos/VeiculoForm';
import { Button } from '@/components/ui/button';
import { Plus, Bike, Car } from 'lucide-react';
import { PlacaBadge } from '@/components/shared/PlacaBadge';
import { toast } from 'sonner';
import { useListarVeiculos, useCriarVeiculo, useEditarVeiculo, useDeletarVeiculo } from '@/hooks/useVeiculos';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Veiculo } from '@/types/database';

export default function VeiculosPage() {
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [excluindo, setExcluindo] = useState<(Veiculo & { clientes: { nome: string } | null }) | null>(null);
  const isMobile = useIsMobile();

  const { data, isLoading } = useListarVeiculos(busca, pagina);
  const criar = useCriarVeiculo();
  const editar = useEditarVeiculo();
  const deletar = useDeletarVeiculo();

  const handleSalvar = async (d: Record<string, string | number | null> & { clienteId: string; id?: string }) => {
    try {
      if (d.id) await editar.mutateAsync(d as Parameters<typeof editar.mutateAsync>[0]);
      else await criar.mutateAsync(d as Parameters<typeof criar.mutateAsync>[0]);
      toast.success(d.id ? 'Veículo atualizado!' : 'Veículo cadastrado!');
    } catch { toast.error('Erro ao salvar veículo.'); }
  };

  const handleExcluir = async () => {
    if (!excluindo) return;
    try {
      await deletar.mutateAsync({ id: excluindo.id, clienteId: excluindo.cliente_id });
      toast.success('Veículo excluído!');
    } catch { toast.error('Erro ao excluir.'); }
    setExcluindo(null);
  };

  const veiculos = data?.data ?? [];

  return (
    <AppLayout>
      <PageHeader titulo="Veículos" subtitulo="Motos e carros cadastrados">
        <Button onClick={() => { setEditando(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Veículo
        </Button>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por placa, marca ou modelo..." onSearch={(v) => { setBusca(v); setPagina(1); }} />
      </div>

      {isLoading ? <LoadingState variant="table" /> : veiculos.length === 0 ? (
        <EmptyState icon={Bike} titulo="Nenhum veículo" descricao="Cadastre o primeiro veículo." actionLabel="Novo Veículo" onAction={() => setFormOpen(true)} />
      ) : isMobile ? (
        <div className="space-y-3">
          {veiculos.map((v) => <VeiculoCard key={v.id} veiculo={v} onEditar={() => { setEditando(v); setFormOpen(true); }} onExcluir={() => setExcluindo(v)} />)}
        </div>
      ) : <VeiculosTable veiculos={veiculos} onEditar={(v) => { setEditando(v); setFormOpen(true); }} onExcluir={setExcluindo} />}

      <ClientePagination pagina={pagina} total={data?.total ?? 0} porPagina={15} onChange={setPagina} />
      <VeiculoForm open={formOpen} onClose={() => setFormOpen(false)} clienteId={editando?.cliente_id ?? ''} veiculo={editando} onSalvar={handleSalvar} loading={criar.isPending || editar.isPending} />
      <ConfirmDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)} titulo="Excluir veículo?" descricao={`Excluir ${excluindo?.marca} ${excluindo?.modelo}?`} onConfirm={handleExcluir} confirmLabel="Excluir" variant="destructive" />
    </AppLayout>
  );
}

function VeiculosTable({ veiculos, onEditar, onExcluir }: { veiculos: (Veiculo & { clientes: { nome: string } | null })[]; onEditar: (v: Veiculo) => void; onExcluir: (v: Veiculo & { clientes: { nome: string } | null }) => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead><tr className="bg-surface-secondary text-xs uppercase tracking-wider text-muted-foreground">
          <th className="text-left px-4 py-3 font-semibold">Tipo</th><th className="text-left px-4 py-3 font-semibold">Placa</th>
          <th className="text-left px-4 py-3 font-semibold">Marca / Modelo</th><th className="text-left px-4 py-3 font-semibold">Ano</th>
          <th className="text-left px-4 py-3 font-semibold">Cor</th><th className="text-left px-4 py-3 font-semibold">Cliente</th>
          <th className="text-right px-4 py-3 font-semibold">Ações</th>
        </tr></thead>
        <tbody>{veiculos.map((v) => {
          const Icon = Bike;
          return (
            <tr key={v.id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3"><Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} /></td>
              <td className="px-4 py-3">{v.placa ? <PlacaBadge placa={v.placa} /> : '—'}</td>
              <td className="px-4 py-3 text-sm font-medium">{v.marca} {v.modelo}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{v.ano || '—'}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{v.cor || '—'}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{v.clientes?.nome || '—'}</td>
              <td className="px-4 py-3 text-right space-x-1">
                <button onClick={() => onEditar(v)} className="text-xs text-primary hover:underline">Editar</button>
                <button onClick={() => onExcluir(v)} className="text-xs text-destructive hover:underline">Excluir</button>
              </td>
            </tr>);
        })}</tbody>
      </table>
    </div>
  );
}
