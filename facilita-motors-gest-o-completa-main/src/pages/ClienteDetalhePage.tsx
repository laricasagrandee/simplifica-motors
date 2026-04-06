import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { ClienteDetailTabs } from '@/components/clientes/ClienteDetailTabs';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClientePorId, useEditarCliente } from '@/hooks/useClientes';
import { useVeiculosPorCliente } from '@/hooks/useVeiculos';

export default function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  const { data: cliente, isLoading } = useClientePorId(id!);
  const { data: veiculos, isLoading: veiculosLoading } = useVeiculosPorCliente(id!);
  const editar = useEditarCliente();

  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (!cliente) return <AppLayout><p className="text-muted-foreground">Cliente não encontrado.</p></AppLayout>;

  return (
    <AppLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="gap-1 mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Button>
      <ClienteCard cliente={cliente} onEditar={() => setFormOpen(true)} />
      <div className="mt-6">
        <ClienteDetailTabs clienteId={id!} veiculos={veiculos ?? []} veiculosLoading={veiculosLoading} />
      </div>
      <ClienteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cliente={cliente}
        onSalvar={async (d) => { await editar.mutateAsync({ id: id!, ...d }); }}
        loading={editar.isPending}
      />
    </AppLayout>
  );
}
