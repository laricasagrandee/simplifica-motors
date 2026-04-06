import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OSDetalheHeader } from '@/components/os/detalhe/OSDetalheHeader';
import { OSTimeline } from '@/components/os/detalhe/OSTimeline';
import { OSDetalheTabs } from '@/components/os/detalhe/OSDetalheTabs';
import { OSAcoesMenu } from '@/components/os/detalhe/OSAcoesMenu';
import { EnviarSatisfacaoBtn } from '@/components/clientes/EnviarSatisfacaoBtn';
import { useOSPorId, useMudarStatusOS, useAtualizarOS } from '@/hooks/useOSDetalhe';
import { useItensPorOS } from '@/hooks/useOSItens';
import { STATUS_OS_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import type { StatusOS } from '@/types/database';

export default function OSDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: os, isLoading } = useOSPorId(id!);
  const mudarStatus = useMudarStatusOS();
  const atualizar = useAtualizarOS();
  const { data: itens } = useItensPorOS(id!);

  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (!os) return <AppLayout><p className="text-muted-foreground">OS não encontrada.</p></AppLayout>;

  const handleMudarStatus = async (status: StatusOS) => {
    await mudarStatus.mutateAsync({ id: os.id, status });
    toast.success(`Status alterado para ${STATUS_OS_CONFIG[status]?.label ?? status}`);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/os')} className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Ordens de Serviço
        </Button>
        <OSAcoesMenu os={os} itens={itens ?? []} />
      </div>
      <OSDetalheHeader os={os} itens={itens ?? []} onMudarStatus={handleMudarStatus} loading={mudarStatus.isPending}
        onRecusar={async (motivo) => { await atualizar.mutateAsync({ id: os.id, motivo_recusa: motivo, valor_orcamento_recusado: os.valor_total ?? 0 }); }} />
      {os.status === 'entregue' && os.clientes?.nome && os.clientes?.telefone && (
        <div className="mb-4">
          <EnviarSatisfacaoBtn clienteNome={os.clientes.nome} clienteTelefone={os.clientes.telefone} />
        </div>
      )}
      <OSTimeline os={os} />
      <OSDetalheTabs os={os} onMudarStatus={handleMudarStatus} mudarStatusLoading={mudarStatus.isPending} />
    </AppLayout>
  );
}
