import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary, sanitizeQuantity } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import type { EstoqueMovimentacao } from '@/types/database';

export function useMovimentacoesEstoque(pecaId: string) {
  return useQuery<EstoqueMovimentacao[]>({
    queryKey: ['estoque-movimentacoes', pecaId],
    queryFn: async () => {
      const { data, error } = await supabase.from('estoque_movimentacoes').select('*').eq('peca_id', pecaId).order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as EstoqueMovimentacao[];
    },
    enabled: !!pecaId,
  });
}

interface EntradaInput { pecaId: string; quantidade: number; precoCusto: number; observacao?: string; }

export function useEntradaEstoque() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async ({ pecaId, quantidade, precoCusto, observacao }: EntradaInput) => {
      const qty = sanitizeQuantity(quantidade);
      const custo = sanitizeMonetary(precoCusto);
      const obs = observacao ? sanitizeInput(observacao, 500) : null;

      const { error: movError } = await supabase.from('estoque_movimentacoes').insert(wt({
        peca_id: pecaId, tipo: 'entrada', quantidade: qty, motivo: obs || 'Compra de peça', preco_unitario: custo,
      }, tenantId));
      if (movError) throw movError;

      const { data: peca, error: pecaErr } = await supabase.from('pecas').select('estoque_atual').eq('id', pecaId).single();
      if (pecaErr) throw pecaErr;

      const { error: upErr } = await supabase.from('pecas').update({ estoque_atual: (peca.estoque_atual ?? 0) + qty, preco_custo: custo }).eq('id', pecaId);
      if (upErr) throw upErr;

      const totalCusto = qty * custo;
      const { error: finErr } = await supabase.from('movimentacoes').insert(wt({
        tipo: 'saida', categoria: 'compra_pecas', descricao: `Entrada estoque: ${qty}x - ${obs || 'Compra'}`, valor: totalCusto, data: new Date().toISOString().split('T')[0],
      }, tenantId));
      if (finErr) throw finErr;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pecas'] });
      qc.invalidateQueries({ queryKey: ['peca', vars.pecaId] });
      qc.invalidateQueries({ queryKey: ['pecas-resumo'] });
      qc.invalidateQueries({ queryKey: ['estoque-movimentacoes', vars.pecaId] });
    },
  });
}
