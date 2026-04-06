import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OSInfoCard } from './OSInfoCard';
import { OSProblemaCard } from './OSProblemaCard';
import { OSMecanicoSelect } from './OSMecanicoSelect';
import { OSItensTab } from './OSItensTab';
import { OSFotosTab } from './OSFotosTab';
import { OSChecklistTab } from './OSChecklistTab';
import { OSPagamentoTab } from './OSPagamentoTab';
import { OSAssinaturaTab } from './OSAssinaturaTab';
import { OSTempoTab } from './OSTempoTab';
import { OSProximoPasso } from './OSProximoPasso';
import { OSResumoFinanceiro } from './OSResumoFinanceiro';
import { AddPecaDialog } from './AddPecaDialog';
import { AddServicoDialog } from './AddServicoDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtualizarOS } from '@/hooks/useOSDetalhe';
import { useItensPorOS, useAdicionarPeca, useAdicionarServico, useRemoverItem } from '@/hooks/useOSItens';
import { useFotosPorOS, useUploadFoto, useRemoverFoto } from '@/hooks/useOSFotos';
import { useAtualizarChecklist } from '@/hooks/useOSChecklist';
import { toast } from 'sonner';
import type { OrdemServico, Cliente, Veiculo, ChecklistItem, StatusOS } from '@/types/database';

interface Props {
  os: OrdemServico;
  onMudarStatus: (status: StatusOS) => Promise<void>;
  mudarStatusLoading: boolean;
}

function getTabsForStatus(status: string) {
  const base = ['info', 'orcamento', 'fotos'];
  switch (status) {
    case 'aberta': case 'em_orcamento': return base;
    case 'aprovada': return [...base, 'checklist'];
    case 'em_execucao': return [...base, 'checklist', 'tempo'];
    case 'concluida': return [...base, 'pagamento'];
    case 'entregue': return [...base, 'pagamento', 'entrega'];
    default: return base;
  }
}

function getDefaultTab(status: string) {
  if (status === 'aberta' || status === 'em_orcamento') return 'orcamento';
  if (status === 'concluida') return 'pagamento';
  if (status === 'entregue') return 'entrega';
  return 'info';
}

const tabLabels: Record<string, string> = {
  info: 'Informações', orcamento: 'Orçamento', fotos: 'Fotos',
  checklist: 'Checklist', tempo: '⏱ Tempo', pagamento: '💰 Pagamento', entrega: '🚗 Entrega',
};

export function OSDetalheTabs({ os, onMudarStatus, mudarStatusLoading }: Props) {
  const visibleTabs = useMemo(() => getTabsForStatus(os.status), [os.status]);
  const [activeTab, setActiveTab] = useState(() => getDefaultTab(os.status));
  const [pecaOpen, setPecaOpen] = useState(false);
  const [servicoOpen, setServicoOpen] = useState(false);

  const atualizar = useAtualizarOS();
  const { data: itens, isLoading: itensLoading } = useItensPorOS(os.id);
  const addPeca = useAdicionarPeca();
  const addServico = useAdicionarServico();
  const removerItem = useRemoverItem();
  const { data: fotos, isLoading: fotosLoading } = useFotosPorOS(os.id);
  const uploadFoto = useUploadFoto();
  const removerFoto = useRemoverFoto();
  const atualizarChecklist = useAtualizarChecklist();

  const cliente = os.clientes as unknown as Cliente;
  const veiculo = os.motos as unknown as Veiculo;
  const checklist = (os.checklist ?? []) as ChecklistItem[];
  const valorPecas = (itens ?? []).filter(i => i.tipo === 'peca').reduce((s, i) => s + i.valor_total, 0);
  const valorMaoObra = (itens ?? []).filter(i => i.tipo === 'servico').reduce((s, i) => s + i.valor_total, 0);
  const localTotal = valorPecas + valorMaoObra - (os.desconto ?? 0);
  const valorTotal = itensLoading ? (os.valor_total ?? 0) : localTotal;

  const handleStatus = async (status: StatusOS) => {
    await onMudarStatus(status);
    if (status === 'concluida') setActiveTab('pagamento');
  };

  return (
    <>
      <OSProximoPasso os={os} itens={itens ?? []} onMudarStatus={handleStatus} onTabChange={setActiveTab} loading={mudarStatusLoading} />
      {itensLoading ? <Skeleton className="h-12 mb-4" /> : (
        <OSResumoFinanceiro valorPecas={valorPecas} valorMaoObra={valorMaoObra} desconto={os.desconto ?? 0} valorTotal={valorTotal}
          formaPagamento={os.forma_pagamento} parcelas={os.parcelas} status={os.status}
          garantiaDias={os.garantia_dias} garantiaAte={os.garantia_ate} />
      )}

      <Tabs value={visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0]} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap">
          {visibleTabs.map(t => <TabsTrigger key={t} value={t}>{tabLabels[t] ?? t}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="info">
          <OSInfoCard cliente={cliente} veiculo={veiculo} />
          <OSProblemaCard problema={os.problema_relatado} diagnostico={os.diagnostico}
            onSalvarDiagnostico={async (d) => { await atualizar.mutateAsync({ id: os.id, diagnostico: d }); toast.success('Diagnóstico salvo'); }}
            loading={atualizar.isPending} />
          <OSMecanicoSelect mecanicoId={os.mecanico_id}
            onMudar={async (id) => { await atualizar.mutateAsync({ id: os.id, mecanico_id: id }); }} />
        </TabsContent>
        <TabsContent value="orcamento">
          <OSItensTab itens={itens ?? []} loading={itensLoading}
            valorPecas={valorPecas} valorMaoObra={valorMaoObra} desconto={os.desconto ?? 0} valorTotal={valorTotal}
            onAdicionarPeca={() => setPecaOpen(true)} onAdicionarServico={() => setServicoOpen(true)}
            onRemover={(id) => removerItem.mutate({ id, osId: os.id })}
            onDescontoChange={(v) => atualizar.mutate({ id: os.id, desconto: v }, {
              onSuccess: () => {
                import('@/hooks/useOSItens').then(({ recalcularTotaisOS }) => {
                  recalcularTotaisOS(os.id).then(() => {
                    qc.invalidateQueries({ queryKey: ['os', os.id] });
                  });
                });
              },
            })} />
        </TabsContent>
        <TabsContent value="fotos">
          <OSFotosTab fotos={fotos ?? []} loading={fotosLoading}
            onUpload={async (file, cat, desc) => { await uploadFoto.mutateAsync({ osId: os.id, file, categoria: cat, descricao: desc }); }}
            onRemover={async (id, url) => { await removerFoto.mutateAsync({ id, osId: os.id, url }); }}
            uploading={uploadFoto.isPending}
            categoriaInicial={os.status === 'cancelada' ? 'recusa' : 'entrada'} />
        </TabsContent>
        {visibleTabs.includes('checklist') && (
          <TabsContent value="checklist">
            <OSChecklistTab checklist={checklist} loading={false}
              onAtualizar={(items) => atualizarChecklist.mutate({ osId: os.id, checklist: items })}
              editavel={os.status === 'em_execucao' || os.status === 'aprovada'} />
          </TabsContent>
        )}
        {visibleTabs.includes('tempo') && (
          <TabsContent value="tempo">
            <OSTempoTab osId={os.id} mecanicoId={os.mecanico_id} />
          </TabsContent>
        )}
        {visibleTabs.includes('pagamento') && (
          <TabsContent value="pagamento">
            <OSPagamentoTab os={os} onMudarStatus={handleStatus} />
          </TabsContent>
        )}
        {visibleTabs.includes('entrega') && (
          <TabsContent value="entrega" className="space-y-6">
            <OSChecklistTab checklist={checklist} loading={false}
              onAtualizar={(items) => atualizarChecklist.mutate({ osId: os.id, checklist: items })}
              editavel={os.status === 'concluida'} tipo="entrega" />
            <OSAssinaturaTab assinatura={os.assinatura_cliente}
              onSalvar={async (b64) => { await atualizar.mutateAsync({ id: os.id, assinatura_cliente: b64 }); toast.success('Assinatura salva'); }}
              loading={atualizar.isPending} />
          </TabsContent>
        )}
      </Tabs>

      <AddPecaDialog open={pecaOpen} onClose={() => setPecaOpen(false)}
        onAdicionar={async (d) => { await addPeca.mutateAsync({ osId: os.id, ...d }); }} loading={addPeca.isPending} />
      <AddServicoDialog open={servicoOpen} onClose={() => setServicoOpen(false)}
        onAdicionar={async (d) => { await addServico.mutateAsync({ osId: os.id, ...d }); }} loading={addServico.isPending} />
    </>
  );
}
