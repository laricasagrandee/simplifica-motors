import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfiguracoes, useAtualizarConfiguracoes, useUploadLogo } from '@/hooks/useConfiguracoes';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { useAuthContext } from '@/components/layout/AuthProvider';
import { ConfigDadosOficina } from '@/components/configuracoes/ConfigDadosOficina';
import { ConfigPlanoAtual } from '@/components/configuracoes/ConfigPlanoAtual';
import { ConfigImpostos } from '@/components/configuracoes/ConfigImpostos';
import { AuditLogViewer } from '@/components/configuracoes/AuditLogViewer';

export default function ConfiguracoesPage() {
  const config = useConfiguracoes();
  const atualizar = useAtualizarConfiguracoes();
  const uploadLogo = useUploadLogo();
  const funcs = useFuncionarios();
  const { funcionario } = useAuthContext();
  const ativos = (funcs.data || []).filter(f => f.ativo).length;
  const c = config.data;
  const isAdmin = funcionario?.cargo === 'admin';

  return (
    <AppLayout>
      <PageHeader titulo="Configurações" subtitulo="Dados da oficina e preferências" />
      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          {isAdmin && <TabsTrigger value="auditoria">Log de Auditoria</TabsTrigger>}
        </TabsList>
        <TabsContent value="geral">
          <div className="space-y-6 mt-4">
            <ConfigDadosOficina config={c} loading={config.isLoading} onSalvar={d => atualizar.mutate(d)} onUploadLogo={f => c && uploadLogo.mutate({ file: f, configId: c.id })} />
            <Separator />
            <ConfigPlanoAtual plano={c?.plano || 'basico'} planoAtivo={c?.plano_ativo ?? true}
              vencimento={c?.data_vencimento_plano} maxFuncionarios={c?.max_funcionarios || 3} funcionariosAtivos={ativos} />
            <Separator />
            <ConfigImpostos
              aliquota={c?.aliquota_imposto ?? 6}
              taxaDebito={c?.taxa_cartao_debito ?? 1.99}
              taxaCredito={c?.taxa_cartao_credito ?? 3.49}
              taxasParcelamento={c?.taxas_parcelamento ?? null}
              onSalvar={v => c && atualizar.mutate({ id: c.id, ...v } as Parameters<typeof atualizar.mutate>[0])}
            />
          </div>
        </TabsContent>
        {isAdmin && (
          <TabsContent value="auditoria">
            <div className="mt-4">
              <AuditLogViewer />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </AppLayout>
  );
}
