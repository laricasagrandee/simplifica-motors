import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import { toast } from 'sonner';

export interface Inventario { id: string; data: string; status: string; observacoes: string | null; criado_em: string; finalizado_em: string | null; }
export interface InventarioItem { id: string; inventario_id: string; peca_id: string; estoque_sistema: number; estoque_contado: number | null; diferenca: number; observacao: string | null; contado_em: string | null; pecas?: { nome: string; codigo: string | null } | null; }

export function useInventarioAtual() {
  const tenantId = useTenantId();
  return useQuery<Inventario | null>({
    queryKey: ['inventario-atual', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('inventarios' as any).select('*').eq('status', 'em_andamento').order('criado_em', { ascending: false }).limit(1), tenantId);
      if (error) throw error;
      return ((data as any)?.[0] as unknown as Inventario) ?? null;
    },
  });
}

export function useItensInventario(inventarioId: string) {
  return useQuery<InventarioItem[]>({
    queryKey: ['inventario-itens', inventarioId],
    enabled: !!inventarioId,
    queryFn: async () => {
      const { data, error } = await supabase.from('inventario_itens' as any).select('*, pecas(nome, codigo)').eq('inventario_id', inventarioId).order('id');
      if (error) throw error;
      return (data ?? []) as unknown as InventarioItem[];
    },
  });
}

export function useCriarInventario() {
  const tenantId = useTenantId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: inv, error: e1 } = await supabase.from('inventarios' as any).insert(wt({} as any, tenantId)).select().single();
      if (e1) throw e1;
      const inventario = inv as unknown as Inventario;
      const { data: pecas, error: e2 } = await tf(supabase.from('pecas').select('id, estoque_atual'), tenantId);
      if (e2) throw e2;
      const itens = (pecas ?? []).map((p: any) => wt({ inventario_id: inventario.id, peca_id: p.id, estoque_sistema: p.estoque_atual ?? 0 }, tenantId));
      if (itens.length > 0) { const { error: e3 } = await supabase.from('inventario_itens' as any).insert(itens as any); if (e3) throw e3; }
      return inventario;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventario-atual'] }); toast.success('Inventário iniciado'); },
    onError: () => toast.error('Erro ao criar inventário'),
  });
}

export function useContarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estoque_contado, observacao }: { id: string; estoque_contado: number; observacao?: string }) => {
      const { error } = await supabase.from('inventario_itens' as any).update({ estoque_contado, observacao: observacao || null, contado_em: new Date().toISOString() } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario-itens'] }),
  });
}

export function useFinalizarInventario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inventarioId: string) => {
      const { data: itens, error: e1 } = await supabase.from('inventario_itens' as any).select('peca_id, estoque_contado, diferenca').eq('inventario_id', inventarioId).not('estoque_contado', 'is', null);
      if (e1) throw e1;
      for (const item of (itens ?? []) as unknown as { peca_id: string; estoque_contado: number; diferenca: number }[]) {
        if (item.diferenca !== 0) { await supabase.from('pecas').update({ estoque_atual: item.estoque_contado }).eq('id', item.peca_id); }
      }
      const { error: e2 } = await supabase.from('inventarios' as any).update({ status: 'finalizado', finalizado_em: new Date().toISOString() } as any).eq('id', inventarioId);
      if (e2) throw e2;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventario-atual'] }); qc.invalidateQueries({ queryKey: ['pecas'] }); toast.success('Inventário finalizado e estoque ajustado'); },
    onError: () => toast.error('Erro ao finalizar inventário'),
  });
}
