import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Plus, AlertTriangle, Wallet, ClipboardList, CalendarClock } from 'lucide-react';
import { useResumoFinanceiro, useMovimentacoes, useCriarMovimentacao, useMarcarComoPago } from '@/hooks/useFinanceiro';
import { useFluxoPorDia } from '@/hooks/useFinanceiroCharts';
import { useCaixaHoje, useAbrirCaixa, useFecharCaixa, useHistoricoCaixa } from '@/hooks/useCaixa';
import { useContasReceber } from '@/hooks/useContasReceber';
import { useContasPagar } from '@/hooks/useContasPagar';
import { FinanceiroResumoCards } from '@/components/financeiro/FinanceiroResumoCards';
import { FinanceiroFiltros, calcularDatas, type FiltrosState } from '@/components/financeiro/FinanceiroFiltros';
import { FinanceiroChart } from '@/components/financeiro/FinanceiroChart';
import { MovimentacaoList } from '@/components/financeiro/MovimentacaoList';
import { MovimentacaoForm } from '@/components/financeiro/MovimentacaoForm';
import { CaixaDiario } from '@/components/financeiro/CaixaDiario';
import { ContasReceberList } from '@/components/financeiro/ContasReceberList';
import { ContasPagarList } from '@/components/financeiro/ContasPagarList';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// NF imports
import { useListarNF, useCriarNF, useOSParaNF } from '@/hooks/useNF';
import { useNFCompleta } from '@/hooks/useNFCompleta';
import { NFList } from '@/components/nf/NFList';
import { NFForm } from '@/components/nf/NFForm';
import { NFPreview } from '@/components/nf/NFPreview';

function useOSPagasHojeCount() {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  return useQuery({ queryKey: ['os-pagas-count-hoje', hoje], queryFn: async () => {
    const { data } = await supabase.from('movimentacoes')
      .select('valor').eq('categoria', 'os_pagamento')
      .gte('data', `${hoje}T00:00:00`).lte('data', `${hoje}T23:59:59`);
    return { count: data?.length ?? 0, total: data?.reduce((s, m) => s + Number(m.valor), 0) ?? 0 };
  }});
}

function useParcelasVencer() {
  return useQuery({ queryKey: ['parcelas-vencer'], queryFn: async () => {
    const { data } = await supabase.from('movimentacoes')
      .select('valor').eq('categoria', 'os_parcela').eq('pago', false);
    return { count: data?.length ?? 0, total: data?.reduce((s, m) => s + Number(m.valor), 0) ?? 0 };
  }});
}

function NFTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const osIdParam = searchParams.get('os_id');
  const [formOpen, setFormOpen] = useState(false);
  const [previewId, setPreviewId] = useState('');
  const nfs = useListarNF();
  const criar = useCriarNF();
  const osDraft = useOSParaNF(osIdParam);
  const nfCompleta = useNFCompleta(previewId);

  useEffect(() => {
    if (osIdParam && osDraft.data) setFormOpen(true);
  }, [osIdParam, osDraft.data]);

  const { data: clientes } = useQuery({
    queryKey: ['clientes-nf-select'],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('id, nome, cpf_cnpj').order('nome');
      return data || [];
    },
  });

  const handleClose = () => {
    setFormOpen(false);
    if (osIdParam) setSearchParams({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)} className="bg-accent text-accent-foreground min-h-[44px] gap-2">
          <Plus className="h-4 w-4" />Emitir NF
        </Button>
      </div>
      <NFList
        notas={nfs.data?.notas as unknown as Parameters<typeof NFList>[0]['notas'] || []}
        loading={nfs.isLoading}
        onVer={id => setPreviewId(id)}
        onImprimir={() => window.print()}
      />
      <NFForm
        open={formOpen}
        onClose={handleClose}
        clientes={clientes || []}
        onEmitir={d => criar.mutate(d)}
        osDraft={osDraft.data ?? undefined}
      />
      <Dialog open={!!previewId} onOpenChange={v => !v && setPreviewId('')}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {nfCompleta.isLoading && <Skeleton className="h-96" />}
          {nfCompleta.data && <NFPreview nf={nfCompleta.data} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FinanceiroPage() {
  const [filtros, setFiltros] = useState<FiltrosState>({ periodo: 'mes', ...calcularDatas('mes') });
  const [pagina, setPagina] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const resumo = useResumoFinanceiro(filtros.dataInicio, filtros.dataFim);
  const movs = useMovimentacoes({ ...filtros, pagina });
  const fluxo = useFluxoPorDia(filtros.dataInicio, filtros.dataFim);
  const criar = useCriarMovimentacao();
  const marcar = useMarcarComoPago();
  const caixaHoje = useCaixaHoje();
  const abrirCaixa = useAbrirCaixa();
  const fecharCaixa = useFecharCaixa();
  const historicoCaixa = useHistoricoCaixa();
  const receber = useContasReceber();
  const pagar = useContasPagar();
  const osPagas = useOSPagasHojeCount();
  const parcVencer = useParcelasVencer();

  const caixaAberto = caixaHoje.data?.status === 'aberto';
  const saldoCaixa = caixaAberto
    ? (caixaHoje.data!.saldo_abertura ?? 0) + (caixaHoje.data!.total_entradas ?? 0) - (caixaHoje.data!.total_saidas ?? 0) : 0;
  const defaultTab = caixaAberto ? 'movimentacoes' : 'caixa';

  return (
    <AppLayout>
      <PageHeader titulo="Financeiro" subtitulo="Controle de caixa, entradas e saídas">
        <Button onClick={() => setFormOpen(true)} className="bg-accent text-accent-foreground min-h-[44px]">
          <Plus className="h-4 w-4 mr-1" />Nova Movimentação
        </Button>
      </PageHeader>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Card className={cn('border-2', caixaAberto ? 'border-success/30' : 'border-destructive/30')}>
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className={cn('h-8 w-8', caixaAberto ? 'text-success' : 'text-destructive')} />
            <div>
              <p className="text-xs text-muted-foreground">Caixa de Hoje</p>
              {caixaAberto ? <MoneyDisplay valor={saldoCaixa} className="text-lg font-bold text-success" /> : <span className="text-sm font-semibold text-destructive">Fechado</span>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">OS Pagas Hoje</p>
              <p className="text-lg font-bold">{osPagas.data?.count ?? 0} <span className="text-sm font-normal text-muted-foreground">· {osPagas.data?.total ? <MoneyDisplay valor={osPagas.data.total} className="inline text-sm" /> : 'R$ 0'}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Parcelas a Vencer</p>
              <p className="text-lg font-bold">{parcVencer.data?.count ?? 0} <span className="text-sm font-normal text-muted-foreground">· {parcVencer.data?.total ? <MoneyDisplay valor={parcVencer.data.total} className="inline text-sm" /> : 'R$ 0'}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!caixaHoje.isLoading && !caixaAberto && (
        <div className="flex items-center gap-3 bg-warning-light border border-warning/30 rounded-lg p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-foreground font-medium flex-1">O caixa de hoje ainda não foi aberto.</p>
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="nf">Notas Fiscais</TabsTrigger>
        </TabsList>
        <TabsContent value="movimentacoes" className="space-y-4">
          <FinanceiroResumoCards entradas={resumo.data?.entradas || 0} saidas={resumo.data?.saidas || 0} saldo={resumo.data?.saldo || 0} loading={resumo.isLoading} />
          <FinanceiroFiltros filtros={filtros} onFiltrosChange={setFiltros} />
          <FinanceiroChart data={fluxo.data || []} loading={fluxo.isLoading} />
          <MovimentacaoList movimentacoes={movs.data?.movimentacoes || []} loading={movs.isLoading} onMarcarPago={id => marcar.mutate(id)} />
        </TabsContent>
        <TabsContent value="caixa">
          <CaixaDiario caixa={caixaHoje.data || null} loading={caixaHoje.isLoading} historico={historicoCaixa.data || []} onAbrir={v => abrirCaixa.mutate(v)} onFechar={id => fecharCaixa.mutate(id)} />
        </TabsContent>
        <TabsContent value="receber">
          <ContasReceberList contas={receber.data || []} loading={receber.isLoading} onMarcarPago={id => marcar.mutate(id)} />
        </TabsContent>
        <TabsContent value="pagar">
          <ContasPagarList contas={pagar.data || []} loading={pagar.isLoading} onMarcarPago={id => marcar.mutate(id)} />
        </TabsContent>
        <TabsContent value="nf"><NFTab /></TabsContent>
      </Tabs>
      <MovimentacaoForm open={formOpen} onClose={() => setFormOpen(false)} onSalvar={d => criar.mutate(d)} />
    </AppLayout>
  );
}
