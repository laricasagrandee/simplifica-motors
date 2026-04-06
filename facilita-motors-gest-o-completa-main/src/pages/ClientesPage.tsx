import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { ClienteSearch } from '@/components/clientes/ClienteSearch';
import { ClienteList } from '@/components/clientes/ClienteList';
import { ClientePagination } from '@/components/clientes/ClientePagination';
import { ClienteModal } from '@/components/clientes/ClienteModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useListarClientes, useDeletarCliente } from '@/hooks/useClientes';
import type { Cliente } from '@/types/database';

export default function ClientesPage() {
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useListarClientes(busca, pagina);
  const deletar = useDeletarCliente();

  const handleExcluir = async () => {
    if (!excluindo) return;
    try {
      await deletar.mutateAsync(excluindo.id);
      toast.success('Cliente excluído!');
    } catch {
      toast.error('Erro ao excluir cliente.');
    }
    setExcluindo(null);
  };

  return (
    <AppLayout>
      <PageHeader titulo="Clientes" subtitulo="Gerencie seus clientes">
        <Button onClick={() => { setEditando(null); setModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </PageHeader>

      <div className="mb-4">
        <ClienteSearch value={busca} onChange={(v) => { setBusca(v); setPagina(1); }} />
      </div>

      <ClienteList
        clientes={data?.data ?? []}
        loading={isLoading}
        onEditar={(c) => { setEditando(c); setModalOpen(true); }}
        onVer={(id) => navigate(`/clientes/${id}`)}
        onExcluir={(c) => setExcluindo(c)}
        onNovo={() => { setEditando(null); setModalOpen(true); }}
      />

      <ClientePagination pagina={pagina} total={data?.total ?? 0} porPagina={10} onChange={setPagina} />

      <ClienteModal open={modalOpen} onClose={() => setModalOpen(false)} cliente={editando} />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(null)}
        titulo="Excluir cliente?"
        descricao={`Tem certeza que deseja excluir "${excluindo?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleExcluir}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </AppLayout>
  );
}
