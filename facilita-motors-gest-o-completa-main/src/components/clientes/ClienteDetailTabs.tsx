import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VeiculoList } from '@/components/clientes/veiculos/VeiculoList';
import { VeiculoForm } from '@/components/clientes/veiculos/VeiculoForm';
import { VeiculoHistoricoOS } from '@/components/clientes/veiculos/VeiculoHistoricoOS';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCriarVeiculo, useEditarVeiculo, useDeletarVeiculo } from '@/hooks/useVeiculos';
import { useClienteOSHistory } from '@/hooks/useClienteOS';
import type { Veiculo } from '@/types/database';

interface Props {
  clienteId: string;
  veiculos: Veiculo[];
  veiculosLoading: boolean;
}

export function ClienteDetailTabs({ clienteId, veiculos, veiculosLoading }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [deletando, setDeletando] = useState<Veiculo | null>(null);

  const criar = useCriarVeiculo();
  const editar = useEditarVeiculo();
  const deletar = useDeletarVeiculo();
  const { data: osHistory, isLoading: osLoading } = useClienteOSHistory(clienteId);

  const handleSalvar = async (data: Record<string, unknown>) => {
    if (data.id) await editar.mutateAsync(data as Parameters<typeof editar.mutateAsync>[0]);
    else await criar.mutateAsync(data as Parameters<typeof criar.mutateAsync>[0]);
  };

  return (
    <>
      <Tabs defaultValue="veiculos">
        <TabsList>
          <TabsTrigger value="veiculos">Veículos ({veiculos.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico OS</TabsTrigger>
        </TabsList>
        <TabsContent value="veiculos" className="mt-4">
          <VeiculoList
            veiculos={veiculos}
            loading={veiculosLoading}
            onAdicionar={() => { setEditando(null); setFormOpen(true); }}
            onEditar={(v) => { setEditando(v); setFormOpen(true); }}
            onDeletar={(v) => setDeletando(v)}
          />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <VeiculoHistoricoOS ordens={osHistory ?? []} loading={osLoading} />
        </TabsContent>
      </Tabs>

      <VeiculoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        clienteId={clienteId}
        veiculo={editando}
        onSalvar={handleSalvar}
        loading={criar.isPending || editar.isPending}
      />

      <ConfirmDialog
        open={!!deletando}
        onOpenChange={(v) => !v && setDeletando(null)}
        titulo="Excluir veículo?"
        descricao={`Tem certeza que deseja excluir ${deletando?.marca} ${deletando?.modelo}?`}
        onConfirm={async () => {
          if (deletando) await deletar.mutateAsync({ id: deletando.id, clienteId });
          setDeletando(null);
        }}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </>
  );
}
