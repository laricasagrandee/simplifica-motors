import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import { toast } from '@/hooks/use-toast';

interface FiltrosMovimentacao { dataInicio: string; dataFim: string; tipo?: 'entrada' | 'saida'; categoria?: string; pago?: boolean; pagina: number; }

export function useResumoFinanceiro(dataInicio: string, dataFim: string) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['financeiro-resumo', dataInicio, dataFim, tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('movimentacoes').select('tipo, valor, pago').gte('data', dataInicio).lte('data', dataFim), tenantId);
      if (error) throw error;
      const entradas = (data || []).filter((m: any) => m.tipo === 'entrada' && m.pago !== false).reduce((s: number, m: any) => s + Number(m.valor), 0);
      const saidas = (data || []).filter((m: any) => m.tipo === 'saida' && m.pago !== false).reduce((s: number, m: any) => s + Number(m.valor), 0);
      return { entradas, saidas, saldo: entradas - saidas };
    },
  });
}

export function useMovimentacoes(filtros: FiltrosMovimentacao) {
  const tenantId = useTenantId();
  const POR_PAGINA = 15;
  return useQuery({
    queryKey: ['movimentacoes', filtros, tenantId],
    queryFn: async () => {
      let q: any = tf(supabase.from('movimentacoes').select('*', { count: 'exact' }).gte('data', filtros.dataInicio).lte('data', filtros.dataFim).order('data', { ascending: false }).range((filtros.pagina - 1) * POR_PAGINA, filtros.pagina * POR_PAGINA - 1), tenantId);
      if (filtros.tipo) q = q.eq('tipo', filtros.tipo);
      if (filtros.categoria) q = q.eq('categoria', filtros.categoria);
      if (filtros.pago !== undefined) q = q.eq('pago', filtros.pago);
      const { data, error, count } = await q;
      if (error) throw error;
      return { movimentacoes: data || [], total: count || 0, paginas: Math.ceil((count || 0) / POR_PAGINA) };
    },
  });
}

interface NovaMovimentacao { tipo: 'entrada' | 'saida'; categoria: string; descricao: string; valor: number; forma_pagamento?: string; data: string; data_vencimento?: string; pago: boolean; }

export function useCriarMovimentacao() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (m: NovaMovimentacao) => {
      const { error } = await supabase.from('movimentacoes').insert(wt({
        tipo: m.tipo, categoria: sanitizeInput(m.categoria, 100), descricao: sanitizeInput(m.descricao, 500),
        valor: sanitizeMonetary(m.valor), forma_pagamento: m.forma_pagamento || null,
        data: m.data, data_vencimento: m.data_vencimento || null, pago: m.pago,
      }, tenantId));
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
      qc.invalidateQueries({ queryKey: ['financeiro-resumo'] });
      toast({ title: 'Movimentação registrada!' });
    },
    onError: () => toast({ title: 'Erro ao registrar', variant: 'destructive' }),
  });
}

export function useMarcarComoPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('movimentacoes').update({ pago: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
      qc.invalidateQueries({ queryKey: ['financeiro-resumo'] });
      qc.invalidateQueries({ queryKey: ['contas-receber'] });
      qc.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast({ title: 'Marcado como pago!' });
    },
  });
}
