import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, FIELD_LIMITS } from '@/lib/sanitize';
import { registrarLog } from '@/hooks/useAuditLog';
import { toast } from 'sonner';
import type { OrdemServico, StatusOS } from '@/types/database';

export function useOSPorId(id: string) {
  return useQuery<OrdemServico>({
    queryKey: ['os', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(*), motos(*), funcionarios(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as OrdemServico;
    },
    enabled: !!id,
  });
}

export function useAtualizarOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: { id: string } & Record<string, unknown>) => {
      const clean: Record<string, unknown> = {};
      if (fields.diagnostico !== undefined) clean.diagnostico = sanitizeInput(String(fields.diagnostico ?? ''), FIELD_LIMITS.texto_livre);
      if (fields.mecanico_id !== undefined) clean.mecanico_id = fields.mecanico_id;
      if (fields.funcionario_id !== undefined) clean.mecanico_id = fields.funcionario_id;
      if (fields.previsao_entrega !== undefined) clean.previsao_entrega = fields.previsao_entrega;
      if (fields.desconto !== undefined) clean.desconto = fields.desconto;
      if (fields.forma_pagamento !== undefined) clean.forma_pagamento = fields.forma_pagamento;
      if (fields.parcelas !== undefined) clean.parcelas = fields.parcelas;
      if (fields.assinatura_cliente !== undefined) clean.assinatura_cliente = fields.assinatura_cliente;
      if (fields.checklist !== undefined) clean.checklist = fields.checklist;
      if (fields.garantia_dias !== undefined) clean.garantia_dias = fields.garantia_dias;
      if (fields.garantia_ate !== undefined) clean.garantia_ate = fields.garantia_ate;
      if (fields.motivo_recusa !== undefined) clean.motivo_recusa = sanitizeInput(String(fields.motivo_recusa ?? ''), FIELD_LIMITS.texto_livre);
      if (fields.valor_orcamento_recusado !== undefined) clean.valor_orcamento_recusado = fields.valor_orcamento_recusado;

      const { error } = await supabase.from('ordens_servico').update(clean).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      const { id, ...fields } = vars;
      registrarLog({ acao: 'editar', tabela: 'ordens_servico', registroId: id, dadosDepois: fields });
      qc.invalidateQueries({ queryKey: ['os', id] });
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
      qc.invalidateQueries({ queryKey: ['os-contadores'] });
    },
  });
}

const STATUS_TIMESTAMPS: Partial<Record<StatusOS, string>> = {
  aprovada: 'data_aprovacao',
  concluida: 'data_conclusao',
  entregue: 'data_entrega',
};

async function baixarEstoqueAprovacao(osId: string) {
  const { data: itens } = await supabase
    .from('os_itens')
    .select('peca_id, quantidade, descricao')
    .eq('os_id', osId)
    .eq('tipo', 'peca');

  if (!itens || itens.length === 0) return [];

  const avisos: string[] = [];
  for (const item of itens) {
    if (!item.peca_id) continue;
    const { data: peca } = await supabase
      .from('pecas')
      .select('estoque_atual, nome')
      .eq('id', item.peca_id)
      .single();
    if (!peca) continue;

    const estoqueAtual = peca.estoque_atual ?? 0;
    if (estoqueAtual < item.quantidade) {
      avisos.push(`Atenção: a peça ${peca.nome} está com estoque insuficiente (tem ${estoqueAtual}, precisa de ${item.quantidade})`);
    }

    await supabase
      .from('pecas')
      .update({ estoque_atual: estoqueAtual - item.quantidade })
      .eq('id', item.peca_id);
    await supabase.from('estoque_movimentacoes').insert({
      peca_id: item.peca_id,
      tipo: 'saida',
      quantidade: item.quantidade,
      motivo: 'aprovacao_os',
      referencia_id: osId,
    });
  }
  return avisos;
}

async function devolverEstoqueCancelamento(osId: string) {
  const { data: itens } = await supabase
    .from('os_itens')
    .select('peca_id, quantidade')
    .eq('os_id', osId)
    .eq('tipo', 'peca');

  if (!itens || itens.length === 0) return;

  for (const item of itens) {
    if (!item.peca_id) continue;
    const { data: peca } = await supabase
      .from('pecas')
      .select('estoque_atual')
      .eq('id', item.peca_id)
      .single();
    if (peca) {
      await supabase
        .from('pecas')
        .update({ estoque_atual: (peca.estoque_atual ?? 0) + item.quantidade })
        .eq('id', item.peca_id);
      await supabase.from('estoque_movimentacoes').insert({
        peca_id: item.peca_id,
        tipo: 'entrada',
        quantidade: item.quantidade,
        motivo: 'cancelamento_os',
        referencia_id: osId,
      });
    }
  }
}

export function useMudarStatusOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusOS }) => {
      let avisos: string[] = [];

      if (status === 'cancelada') {
        await devolverEstoqueCancelamento(id);
      }

      if (status === 'aprovada') {
        avisos = await baixarEstoqueAprovacao(id);
      }

      const update: Record<string, unknown> = { status };
      const tsField = STATUS_TIMESTAMPS[status];
      if (tsField) update[tsField] = new Date().toISOString();

      const { error } = await supabase.from('ordens_servico').update(update).eq('id', id);
      if (error) throw error;

      return avisos;
    },
    onSuccess: (avisos, vars) => {
      registrarLog({ acao: 'status', tabela: 'ordens_servico', registroId: vars.id, dadosDepois: { status: vars.status } });
      if (avisos && avisos.length > 0) {
        avisos.forEach((a: string) => toast.warning(a));
      }
      qc.invalidateQueries({ queryKey: ['os', vars.id] });
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
      qc.invalidateQueries({ queryKey: ['os-contadores'] });
      qc.invalidateQueries({ queryKey: ['pecas'] });
    },
  });
}
