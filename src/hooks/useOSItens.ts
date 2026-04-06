import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary, sanitizeQuantity } from '@/lib/sanitize';
import type { OSItem } from '@/types/database';

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
  return useMutation({
    mutationFn: async (input: { osId: string; pecaId?: string; descricao: string; quantidade: number; valorUnitario: number }) => {
      const { error } = await supabase.from('os_itens').insert({
        os_id: input.osId,
        tipo: 'peca',
        peca_id: input.pecaId || null,
        descricao: sanitizeInput(input.descricao, 200),
        quantidade: sanitizeQuantity(input.quantidade),
        valor_unitario: sanitizeMonetary(input.valorUnitario),
        valor_total: sanitizeMonetary(input.quantidade * input.valorUnitario),
      });
      if (error) throw error;
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
  return useMutation({
    mutationFn: async (input: { osId: string; descricao: string; valorUnitario: number }) => {
      const { error } = await supabase.from('os_itens').insert({
        os_id: input.osId,
        tipo: 'servico',
        descricao: sanitizeInput(input.descricao, 200),
        quantidade: 1,
        valor_unitario: sanitizeMonetary(input.valorUnitario),
        valor_total: sanitizeMonetary(input.valorUnitario),
      });
      if (error) throw error;
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
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['os-itens', v.osId] });
      qc.invalidateQueries({ queryKey: ['os', v.osId] });
      qc.invalidateQueries({ queryKey: ['pecas'] });
    },
  });
}
