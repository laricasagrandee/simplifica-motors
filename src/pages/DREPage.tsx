import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDREMensal, useDREComparativo, useDREEvolucao } from '@/hooks/useDRE';
import { DRETabela } from '@/components/dre/DRETabela';
import { DREComparativo } from '@/components/dre/DREComparativo';
import { DREEvolucaoChart } from '@/components/dre/DREEvolucaoChart';
import { DREMesSelector } from '@/components/dre/DREMesSelector';
import { DREExportar } from '@/components/dre/DREExportar';

export default function DREPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const dre = useDREMensal(mes, ano);
  const comp = useDREComparativo(mes, ano);
  const evolucao = useDREEvolucao();

  return (
    <AppLayout>
      <PageHeader titulo="DRE — Resultado do Exercício" subtitulo="Demonstrativo mensal">
        <DREExportar />
      </PageHeader>
      <div className="space-y-4">
        <DREMesSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
        <Tabs defaultValue="demonstrativo">
          <TabsList><TabsTrigger value="demonstrativo">Demonstrativo</TabsTrigger><TabsTrigger value="comparativo">Comparativo</TabsTrigger><TabsTrigger value="evolucao">Evolução</TabsTrigger></TabsList>
          <TabsContent value="demonstrativo"><DRETabela dre={dre.data} loading={dre.isLoading} /></TabsContent>
          <TabsContent value="comparativo"><DREComparativo dreAtual={comp.atual.data} dreAnterior={comp.anterior.data} loading={comp.atual.isLoading || comp.anterior.isLoading} /></TabsContent>
          <TabsContent value="evolucao"><DREEvolucaoChart data={evolucao.data || []} loading={evolucao.isLoading} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
