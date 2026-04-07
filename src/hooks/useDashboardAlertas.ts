import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

const STALE_TIME = 30_000;

export interface Alerta {
  id: string;
  tipo: 'estoque' | 'os_atrasada' | 'pagamento' | 'aniversario' | 'garantia' | 'orcamento_pendente' | 'aguardando_retirada' | 'execucao_longa';
  mensagem: string;
  prioridade?: number;
}

export function useAlertasDashboard() {
  const tenantId = useTenantId();
  return useQuery<Alerta[]>({
    queryKey: ['dashboard-alertas', tenantId],
    queryFn: async () => {
      const alertas: Alerta[] = [];

      const { data: pecas } = await tf(supabase.from('pecas').select('nome, estoque_atual, estoque_minimo'), tenantId);
      (pecas ?? []).forEach((p: any) => {
        if ((p.estoque_atual ?? 0) <= (p.estoque_minimo ?? 0)) {
          alertas.push({ id: `estoque:${p.nome}`, tipo: 'estoque', mensagem: `${p.nome} — estoque ${p.estoque_atual === 0 ? 'zerado' : `mínimo (${p.estoque_atual} un)`}` });
        }
      });

      const threeDaysAgo = new Date(); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: osParadas } = await tf(supabase.from('ordens_servico').select('numero, criado_em, status').in('status', ['aberta', 'em_orcamento']).lte('criado_em', threeDaysAgo.toISOString()), tenantId);
      (osParadas ?? []).forEach((os: any) => {
        const dias = Math.floor((Date.now() - new Date(os.criado_em!).getTime()) / 86400000);
        alertas.push({ id: `os_atrasada:${os.numero}`, tipo: 'os_atrasada', mensagem: `OS-${os.numero} ${os.status === 'em_orcamento' ? 'em orçamento' : 'aberta'} há ${dias} dias` });
      });

      const hojeStr = new Date().toISOString().slice(0, 10);
      const { data: osAtrasadasPrev } = await tf(supabase.from('ordens_servico').select('numero, previsao_entrega').eq('status', 'em_execucao').not('previsao_entrega', 'is', null).lt('previsao_entrega', hojeStr), tenantId);
      (osAtrasadasPrev ?? []).forEach((os: any) => {
        alertas.push({ id: `os_atrasada_prev:${os.numero}`, tipo: 'os_atrasada', mensagem: `OS-${os.numero} atrasada! Previsão era ${new Date(os.previsao_entrega as string + 'T00:00:00').toLocaleDateString('pt-BR')}`, prioridade: 1 });
      });

      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: osExecucao } = await tf(supabase.from('ordens_servico').select('numero, criado_em').eq('status', 'em_execucao').lte('criado_em', sevenDaysAgo.toISOString()), tenantId);
      (osExecucao ?? []).forEach((os: any) => {
        const dias = Math.floor((Date.now() - new Date(os.criado_em!).getTime()) / 86400000);
        alertas.push({ id: `execucao_longa:${os.numero}`, tipo: 'execucao_longa', mensagem: `OS-${os.numero} em execução há ${dias} dias`, prioridade: 2 });
      });

      const tresDiasAtras = new Date(Date.now() - 3 * 86400000).toISOString();
      const { data: semResposta } = await tf(supabase.from('ordens_servico').select('numero, criado_em, clientes(nome)').eq('status', 'em_orcamento').lte('criado_em', tresDiasAtras), tenantId);
      (semResposta ?? []).forEach((os: any) => {
        const dias = Math.floor((Date.now() - new Date(os.criado_em!).getTime()) / 86400000);
        const nome = os.clientes?.nome || 'Cliente';
        alertas.push({ id: `orcamento_pendente:${os.numero}`, tipo: 'orcamento_pendente', mensagem: `OS-${os.numero} (${nome}) sem resposta ao orçamento há ${dias} dias`, prioridade: 2 });
      });

      const doisDiasAtras = new Date(Date.now() - 2 * 86400000).toISOString();
      const { data: esperando } = await tf(supabase.from('ordens_servico').select('numero, data_conclusao, clientes(nome)').eq('status', 'concluida').lte('data_conclusao', doisDiasAtras), tenantId);
      (esperando ?? []).forEach((os: any) => {
        const dias = Math.floor((Date.now() - new Date(os.data_conclusao!).getTime()) / 86400000);
        const nome = os.clientes?.nome || 'Cliente';
        alertas.push({ id: `aguardando_retirada:${os.numero}`, tipo: 'aguardando_retirada', mensagem: `OS-${os.numero} (${nome}) pronta há ${dias} dias aguardando retirada`, prioridade: 3 });
      });

      const hoje = new Date().toISOString().slice(0, 10);
      const { data: pagVencidos } = await tf(supabase.from('movimentacoes').select('descricao, data_vencimento').eq('pago', false).lt('data_vencimento', hoje), tenantId);
      (pagVencidos ?? []).forEach((m: any) => {
        const dias = Math.floor((Date.now() - new Date(m.data_vencimento!).getTime()) / 86400000);
        alertas.push({ id: `pagamento:${m.descricao}`, tipo: 'pagamento', mensagem: `${m.descricao} — vencido há ${dias} dia${dias !== 1 ? 's' : ''}` });
      });

      const { data: anivClientes } = await tf(supabase.from('clientes').select('nome, data_nascimento').not('data_nascimento', 'is', null), tenantId);
      const hojeDate = new Date();
      (anivClientes ?? []).forEach((c: any) => {
        if (!c.data_nascimento) return;
        const [, mes, dia] = c.data_nascimento.split('-').map(Number);
        for (let d = 0; d <= 7; d++) {
          const check = new Date(hojeDate); check.setDate(hojeDate.getDate() + d);
          if (check.getMonth() + 1 === mes && check.getDate() === dia) {
            alertas.push({ id: `aniversario:${c.nome}`, tipo: 'aniversario', mensagem: `🎂 ${c.nome} faz aniversário em ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}` });
            break;
          }
        }
      });

      const em7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const { data: garantias } = await tf(supabase.from('ordens_servico').select('numero, garantia_ate').gte('garantia_ate', hoje).lte('garantia_ate', em7dias), tenantId);
      (garantias ?? []).forEach((g: any) => {
        const diasRestantes = Math.ceil((new Date(g.garantia_ate!).getTime() - Date.now()) / 86400000);
        alertas.push({ id: `garantia:${g.numero}`, tipo: 'garantia', mensagem: `OS-${g.numero} garantia expira em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}` });
      });

      const prioMap: Record<string, number> = { estoque: 0, os_atrasada: 1, execucao_longa: 2, orcamento_pendente: 3, aguardando_retirada: 3, pagamento: 4, garantia: 5, aniversario: 6 };
      alertas.sort((a, b) => (prioMap[a.tipo] ?? 9) - (prioMap[b.tipo] ?? 9));
      return alertas;
    },
    staleTime: STALE_TIME,
  });
}
