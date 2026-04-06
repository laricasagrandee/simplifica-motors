import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCMVResumo, useCMVPorOS, useCMVPorPeca, useCMVEvolucao } from '@/hooks/useCMV';
import { CMVResumoCards } from '@/components/cmv/CMVResumoCards';
import { CMVFiltros, calcularPeriodoCMV, type PeriodoCMV } from '@/components/cmv/CMVFiltros';
import { CMVEvolucaoChart } from '@/components/cmv/CMVEvolucaoChart';
import { CMVPorOS } from '@/components/cmv/CMVPorOS';
import { CMVPorPeca } from '@/components/cmv/CMVPorPeca';

export default function CMVPage() {
  const [periodo, setPeriodo] = useState<PeriodoCMV>('1m');
  const datas = calcularPeriodoCMV(periodo);
  const resumo = useCMVResumo(datas);
  const porOS = useCMVPorOS(datas);
  const porPeca = useCMVPorPeca(datas);
  const evolucao = useCMVEvolucao();

  return (
    <AppLayout>
      <PageHeader titulo="CMV — Custo e Margem" subtitulo="Análise de rentabilidade" />
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
    </AppLayout>
  );
}
