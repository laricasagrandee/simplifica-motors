import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { useFuncionarios, useCriarFuncionario, useEditarFuncionario, useToggleAtivoFuncionario } from '@/hooks/useFuncionarios';
import { useComissaoTodosMecanicos, useRegistrarComissao } from '@/hooks/useComissao';
import { FuncionarioGrid } from '@/components/funcionarios/FuncionarioGrid';
import { FuncionarioForm } from '@/components/funcionarios/FuncionarioForm';
import { FuncionarioResumo } from '@/components/funcionarios/FuncionarioResumo';
import { ComissaoTable } from '@/components/funcionarios/ComissaoTable';
import { ComissaoFiltros, calcularPeriodoComissao, type PeriodoComissao } from '@/components/funcionarios/ComissaoFiltros';
import { MetasDialog } from '@/components/funcionarios/MetasDialog';
import type { Funcionario } from '@/types/database';

export default function FuncionariosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Funcionario | undefined>();
  const [metasOpen, setMetasOpen] = useState(false);
  const [periodoComissao, setPeriodoComissao] = useState<PeriodoComissao>('este_mes');
  const datasComissao = calcularPeriodoComissao(periodoComissao);

  const funcs = useFuncionarios();
  const criar = useCriarFuncionario();
  const editar = useEditarFuncionario();
  const toggle = useToggleAtivoFuncionario();
  const comissoes = useComissaoTodosMecanicos(datasComissao);
  const registrar = useRegistrarComissao();

  const lista = funcs.data || [];
  const ativos = lista.filter(f => f.ativo).length;
  const mecanicos = lista.filter(f => f.cargo === 'mecanico' && f.ativo).length;

  return (
    <AppLayout>
      <PageHeader titulo="Equipe" subtitulo="Gestão de funcionários e produtividade">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setMetasOpen(true)} className="min-h-[44px] gap-2"><Target className="h-4 w-4" />Metas</Button>
          <Button onClick={() => { setEditando(undefined); setFormOpen(true); }} className="bg-accent text-accent-foreground min-h-[44px] gap-2"><Plus className="h-4 w-4" />Novo Funcionário</Button>
        </div>
      </PageHeader>
      <Tabs defaultValue="equipe">
        <TabsList><TabsTrigger value="equipe">Equipe</TabsTrigger><TabsTrigger value="comissoes">Comissões</TabsTrigger></TabsList>
        <TabsContent value="equipe" className="space-y-2">
          <FuncionarioResumo total={lista.length} mecanicos={mecanicos} ativos={ativos} />
          <FuncionarioGrid funcionarios={lista} loading={funcs.isLoading} onEditar={f => { setEditando(f); setFormOpen(true); }} onToggleAtivo={(id, ativo) => toggle.mutate({ id, ativo })} onNovo={() => { setEditando(undefined); setFormOpen(true); }} />
        </TabsContent>
        <TabsContent value="comissoes">
          <ComissaoFiltros periodo={periodoComissao} onPeriodoChange={setPeriodoComissao} />
          <ComissaoTable comissoes={comissoes.data || []} loading={comissoes.isLoading} onRegistrar={(nome, valor) => registrar.mutate({ nome, valor })} />
        </TabsContent>
      </Tabs>
      <FuncionarioForm open={formOpen} onClose={() => setFormOpen(false)} funcionario={editando}
        onSalvar={d => d.id ? editar.mutate(d as Parameters<typeof editar.mutate>[0]) : criar.mutate(d)} />
      <MetasDialog open={metasOpen} onClose={() => setMetasOpen(false)} />
    </AppLayout>
  );
}
