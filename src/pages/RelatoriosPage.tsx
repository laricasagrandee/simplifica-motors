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
        <RelatorioFiltros periodo={tipoPeriodo} datas={datas} onPeriodoChange={handlePeriodo} onDatasChange={setDatas} />
        <Tabs defaultValue="faturamento">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
            <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          </TabsList>
          <TabsContent value="faturamento" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TicketMedioCard valor={ticket.data?.valor || 0} count={ticket.data?.count || 0} loading={ticket.isLoading} />
              <OSPorStatusChart data={osStatus.data || []} loading={osStatus.isLoading} />
            </div>
            <FaturamentoChart data={fat.data?.porDia || []} loading={fat.isLoading} />
          </TabsContent>
          <TabsContent value="avancado" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TempoMedioOSCard periodo={datas} />
              <ReceitaPagamentoChart periodo={datas} />
            </div>
            <LucratividadeServicoChart periodo={datas} />
            <RecusasChart periodo={datas} />
          </TabsContent>
          <TabsContent value="produtividade"><ProdutividadeMecanicosTable mecanicos={prod.data || []} loading={prod.isLoading} /></TabsContent>
          <TabsContent value="rankings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PecasRankingTable pecas={pecas.data || []} loading={pecas.isLoading} />
              <ClientesRankingTable clientes={clientes.data || []} loading={clientes.isLoading} />
              <VeiculosRankingTable veiculos={veiculos.data || []} loading={veiculos.isLoading} />
              <ServicosRankingTable servicos={servicos.data || []} loading={servicos.isLoading} />
            </div>
          </TabsContent>
          <TabsContent value="comparativo"><ComparativoMensalChart data={comp.data || []} loading={comp.isLoading} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
