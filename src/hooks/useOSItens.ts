import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary, sanitizeQuantity } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { withTenant } from '@/lib/tenantHelper';
import type { OSItem } from '@/types/database';

async function recalcularTotaisOS(osId: string) {
  const { data: itens } = await supabase
    .from('os_itens')
    .select('tipo, valor_total, peca_id, quantidade')
    .eq('os_id', osId);

  const items = itens ?? [];
  const valorPecas = items.filter(i => i.tipo === 'peca').reduce((s, i) => s + Number(i.valor_total), 0);
  const valorMaoObra = items.filter(i => i.tipo === 'servico').reduce((s, i) => s + Number(i.valor_total), 0);

  const { data: osData } = await supabase.from('ordens_servico').select('desconto').eq('id', osId).single();
  const desconto = osData?.desconto ?? 0;
  const valorTotal = valorPecas + valorMaoObra - desconto;

  let custoPecas = 0;
  const pecasComId = items.filter(i => i.tipo === 'peca' && i.peca_id);
  if (pecasComId.length > 0) {
    const pecaIds = pecasComId.map(i => i.peca_id!);
    const { data: pecasData } = await supabase.from('pecas').select('id, preco_custo').in('id', pecaIds);
    const custoMap = new Map((pecasData ?? []).map(p => [p.id, p.preco_custo]));
    for (const item of pecasComId) {
      const custo = custoMap.get(item.peca_id!) ?? 0;
      custoPecas += custo * item.quantidade;
    }
  }

  const lucroBruto = valorTotal - custoPecas;

  await supabase.from('ordens_servico').update({
    valor_pecas: valorPecas,
    valor_mao_obra: valorMaoObra,
    valor_total: valorTotal,
    custo_pecas: custoPecas,
    lucro_bruto: lucroBruto,
  }).eq('id', osId);
}

export function useItensPorOS(osId: string) {
  return useQuery<OSItem[]>({
    queryKey: ['os-itens', osId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_itens')
        .select('*')
        .eq('os_id', osId)
        .order('criado_em');
      if (error) throw error;
      return (data ?? []) as unknown as OSItem[];
    },
    enabled: !!osId,
  });
}

export function useAdicionarPeca() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (input: { osId: string; pecaId?: string; descricao: string; quantidade: number; valorUnitario: number }) => {
      const { error } = await supabase.from('os_itens').insert(withTenant({
        os_id: input.osId,
        tipo: 'peca',
        peca_id: input.pecaId || null,
        descricao: sanitizeInput(input.descricao, 200),
        quantidade: sanitizeQuantity(input.quantidade),
        valor_unitario: sanitizeMonetary(input.valorUnitario),
        valor_total: sanitizeMonetary(input.quantidade * input.valorUnitario),
      }, tenantId));
      if (error) throw error;
      await recalcularTotaisOS(input.osId);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['os-itens', v.osId] });
      qc.invalidateQueries({ queryKey: ['os', v.osId] });
      qc.invalidateQueries({ queryKey: ['pecas'] });
    },
  });
}

export function useAdicionarServico() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (input: { osId: string; descricao: string; valorUnitario: number }) => {
      const { error } = await supabase.from('os_itens').insert(withTenant({
        os_id: input.osId,
        tipo: 'servico',
        descricao: sanitizeInput(input.descricao, 200),
        quantidade: 1,
        valor_unitario: sanitizeMonetary(input.valorUnitario),
        valor_total: sanitizeMonetary(input.valorUnitario),
      }, tenantId));
      if (error) throw error;
      await recalcularTotaisOS(input.osId);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['os-itens', v.osId] });
      qc.invalidateQueries({ queryKey: ['os', v.osId] });
    },
  });
}

export function useRemoverItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, osId }: { id: string; osId: string }) => {
      const { error } = await supabase.from('os_itens').delete().eq('id', id);
      if (error) throw error;
      await recalcularTotaisOS(osId);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['os-itens', v.osId] });
      qc.invalidateQueries({ queryKey: ['os', v.osId] });
      qc.invalidateQueries({ queryKey: ['pecas'] });
    },
  });
}

export { recalcularTotaisOS };
