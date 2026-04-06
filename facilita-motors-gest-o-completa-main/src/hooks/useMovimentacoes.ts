import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary } from '@/lib/sanitize';
import { toast } from '@/hooks/use-toast';

interface FiltrosMovimentacao {
  dataInicio: string;
  dataFim: string;
  tipo?: 'entrada' | 'saida';
  categoria?: string;
  pagina: number;
}

const POR_PAGINA = 15;

export function useListarMovimentacoes(filtros: FiltrosMovimentacao) {
  return useQuery({
    queryKey: ['movimentacoes', filtros],
    queryFn: async () => {
      let q = supabase
        .from('movimentacoes')
        .select('*', { count: 'exact' })
        .gte('data', filtros.dataInicio)
        .lte('data', filtros.dataFim + 'T23:59:59')
        .order('data', { ascending: false })
        .range((filtros.pagina - 1) * POR_PAGINA, filtros.pagina * POR_PAGINA - 1);

      if (filtros.tipo) q = q.eq('tipo', filtros.tipo);
      if (filtros.categoria) q = q.eq('categoria', filtros.categoria);

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}

export function useSomaMovimentacoes(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ['movimentacoes-soma', dataInicio, dataFim],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('tipo, valor')
        .gte('data', dataInicio)
        .lte('data', dataFim + 'T23:59:59');
      if (error) throw error;
      const rows = data ?? [];
      const entradas = rows.filter(m => m.tipo === 'entrada').reduce((s, m) => s + Number(m.valor), 0);
      const saidas = rows.filter(m => m.tipo === 'saida').reduce((s, m) => s + Number(m.valor), 0);
      return { entradas, saidas, saldo: entradas - saidas };
    },
  });
}

interface NovaMovimentacao {
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento?: string;
  data: string;
  pago: boolean;
}

export function useCriarMovimentacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: NovaMovimentacao) => {
      const { error } = await supabase.from('movimentacoes').insert({
        tipo: m.tipo,
        categoria: sanitizeInput(m.categoria, 100),
        descricao: sanitizeInput(m.descricao, 500),
        valor: sanitizeMonetary(m.valor),
        forma_pagamento: m.forma_pagamento || null,
        data: m.data,
        pago: m.pago,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
      qc.invalidateQueries({ queryKey: ['movimentacoes-soma'] });
      toast({ title: 'Movimentação registrada!' });
    },
    onError: () => toast({ title: 'Erro ao registrar', variant: 'destructive' }),
  });
}

export function useDeletarMovimentacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('movimentacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
      qc.invalidateQueries({ queryKey: ['movimentacoes-soma'] });
      toast({ title: 'Movimentação excluída!' });
    },
  });
}
