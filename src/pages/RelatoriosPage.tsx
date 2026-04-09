import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatorioFiltros, calcularPeriodoRelatorio, type TipoPeriodo, type PeriodoRelatorio } from '@/components/relatorios/RelatorioFiltros';
import { FaturamentoChart } from '@/components/relatorios/FaturamentoChart';
import { TicketMedioCard } from '@/components/relatorios/TicketMedioCard';
import { OSPorStatusChart } from '@/components/relatorios/OSPorStatusChart';
import { ProdutividadeMecanicosTable } from '@/components/relatorios/ProdutividadeMecanicosTable';
import { PecasRankingTable } from '@/components/relatorios/PecasRankingTable';
import { ClientesRankingTable } from '@/components/relatorios/ClientesRankingTable';
import { VeiculosRankingTable } from '@/components/relatorios/VeiculosRankingTable';
import { ServicosRankingTable } from '@/components/relatorios/ServicosRankingTable';
import { ComparativoMensalChart } from '@/components/relatorios/ComparativoMensalChart';
import { LucratividadeServicoChart } from '@/components/relatorios/LucratividadeServicoChart';
import { TempoMedioCard as TempoMedioOSCard } from '@/components/relatorios/TempoMedioCard';
import { ReceitaPagamentoChart } from '@/components/relatorios/ReceitaPagamentoChart';
import { RecusasChart } from '@/components/relatorios/RecusasChart';
import { useFaturamentoPeriodo, useTicketMedio, useOSPorStatus, useProdutividadeMecanicos, usePecasMaisVendidas, useClientesRanking, useVeiculosMaisAtendidos, useServicosMaisRealizados, useComparativoMensal } from '@/hooks/useRelatorios';

// CMV imports
import { useCMVResumo, useCMVPorOS, useCMVPorPeca, useCMVEvolucao } from '@/hooks/useCMV';
import { CMVResumoCards } from '@/components/cmv/CMVResumoCards';
import { CMVFiltros, calcularPeriodoCMV, type PeriodoCMV } from '@/components/cmv/CMVFiltros';
import { CMVEvolucaoChart } from '@/components/cmv/CMVEvolucaoChart';
import { CMVPorOS } from '@/components/cmv/CMVPorOS';
import { CMVPorPeca } from '@/components/cmv/CMVPorPeca';

// DRE imports
import { useDREMensal, useDREComparativo, useDREEvolucao } from '@/hooks/useDRE';
import { DRETabela } from '@/components/dre/DRETabela';
import { DREComparativo } from '@/components/dre/DREComparativo';
import { DREEvolucaoChart } from '@/components/dre/DREEvolucaoChart';
import { DREMesSelector } from '@/components/dre/DREMesSelector';
import { DREExportar } from '@/components/dre/DREExportar';

function CMVContent() {
  const [periodo, setPeriodo] = useState<PeriodoCMV>('1m');
  const datas = calcularPeriodoCMV(periodo);
  const resumo = useCMVResumo(datas);
  const porOS = useCMVPorOS(datas);
  const porPeca = useCMVPorPeca(datas);
  const evolucao = useCMVEvolucao();

  return (
    <div className="space-y-4">
      <CMVFiltros periodo={periodo} onPeriodoChange={setPeriodo} />
      <CMVResumoCards faturamento={resumo.data?.faturamento || 0} cmv={resumo.data?.cmv || 0} lucro={resumo.data?.lucro || 0} margem={resumo.data?.margem || 0} loading={resumo.isLoading} />
      <CMVEvolucaoChart data={evolucao.data || []} loading={evolucao.isLoading} />
      <Tabs defaultValue="por-os">
        <TabsList><TabsTrigger value="por-os">Por OS</TabsTrigger><TabsTrigger value="por-peca">Por Peça</TabsTrigger></TabsList>
        <TabsContent value="por-os"><CMVPorOS ordens={porOS.data || []} loading={porOS.isLoading} /></TabsContent>
        <TabsContent value="por-peca"><CMVPorPeca pecas={porPeca.data || []} loading={porPeca.isLoading} /></TabsContent>
      </Tabs>
    </div>
  );
}

function DREContent() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const dre = useDREMensal(mes, ano);
  const comp = useDREComparativo(mes, ano);
  const evolucao = useDREEvolucao();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DREMesSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
        <DREExportar />
      </div>
      <Tabs defaultValue="demonstrativo">
        <TabsList><TabsTrigger value="demonstrativo">Demonstrativo</TabsTrigger><TabsTrigger value="comparativo">Comparativo</TabsTrigger><TabsTrigger value="evolucao">Evolução</TabsTrigger></TabsList>
        <TabsContent value="demonstrativo"><DRETabela dre={dre.data} loading={dre.isLoading} /></TabsContent>
        <TabsContent value="comparativo"><DREComparativo dreAtual={comp.atual.data} dreAnterior={comp.anterior.data} loading={comp.atual.isLoading || comp.anterior.isLoading} /></TabsContent>
        <TabsContent value="evolucao"><DREEvolucaoChart data={evolucao.data || []} loading={evolucao.isLoading} /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function RelatoriosPage() {
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>('mes');
  const [datas, setDatas] = useState<PeriodoRelatorio>(calcularPeriodoRelatorio('mes'));
  const handlePeriodo = (p: TipoPeriodo) => { setTipoPeriodo(p); if (p !== 'custom') setDatas(calcularPeriodoRelatorio(p)); };

  const fat = useFaturamentoPeriodo(datas);
  const ticket = useTicketMedio(datas);
  const osStatus = useOSPorStatus(datas);
  const prod = useProdutividadeMecanicos(datas);
  const pecas = usePecasMaisVendidas(datas, 10);
  const clientes = useClientesRanking(datas, 10);
  const veiculos = useVeiculosMaisAtendidos(datas);
  const servicos = useServicosMaisRealizados(datas);
  const comp = useComparativoMensal();

  return (
    <AppLayout>
      <PageHeader titulo="Relatórios e Análises" subtitulo="Métricas e rankings da oficina" />
      <div className="space-y-4">
        <Tabs defaultValue="faturamento">
          <TabsList className="w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
            <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
            <TabsTrigger value="cmv">CMV</TabsTrigger>
            <TabsTrigger value="dre">DRE</TabsTrigger>
          </TabsList>

          <TabsContent value="faturamento" className="space-y-4">
            <RelatorioFiltros periodo={tipoPeriodo} datas={datas} onPeriodoChange={handlePeriodo} onDatasChange={setDatas} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TicketMedioCard valor={ticket.data?.valor || 0} count={ticket.data?.count || 0} loading={ticket.isLoading} />
              <OSPorStatusChart data={osStatus.data || []} loading={osStatus.isLoading} />
            </div>
            <FaturamentoChart data={fat.data?.porDia || []} loading={fat.isLoading} />
          </TabsContent>
          <TabsContent value="avancado" className="space-y-4">
            <RelatorioFiltros periodo={tipoPeriodo} datas={datas} onPeriodoChange={handlePeriodo} onDatasChange={setDatas} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TempoMedioOSCard periodo={datas} />
              <ReceitaPagamentoChart periodo={datas} />
            </div>
            <LucratividadeServicoChart periodo={datas} />
            <RecusasChart periodo={datas} />
          </TabsContent>
          <TabsContent value="produtividade">
            <RelatorioFiltros periodo={tipoPeriodo} datas={datas} onPeriodoChange={handlePeriodo} onDatasChange={setDatas} />
            <ProdutividadeMecanicosTable mecanicos={prod.data || []} loading={prod.isLoading} />
          </TabsContent>
          <TabsContent value="rankings">
            <RelatorioFiltros periodo={tipoPeriodo} datas={datas} onPeriodoChange={handlePeriodo} onDatasChange={setDatas} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PecasRankingTable pecas={pecas.data || []} loading={pecas.isLoading} />
              <ClientesRankingTable clientes={clientes.data || []} loading={clientes.isLoading} />
              <VeiculosRankingTable veiculos={veiculos.data || []} loading={veiculos.isLoading} />
              <ServicosRankingTable servicos={servicos.data || []} loading={servicos.isLoading} />
            </div>
          </TabsContent>
          <TabsContent value="comparativo">
            <ComparativoMensalChart data={comp.data || []} loading={comp.isLoading} />
          </TabsContent>
          <TabsContent value="cmv"><CMVContent /></TabsContent>
          <TabsContent value="dre"><DREContent /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
