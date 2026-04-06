import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE = 30_000;

export function useOSAbertas() {
  return useQuery({
    queryKey: ['dash-os-abertas'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("entregue","cancelada")');
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE,
  });
}

export function useOSConcluidasHoje() {
  return useQuery({
    queryKey: ['dash-os-concluidas-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluida')
        .gte('data_conclusao', `${hoje}T00:00:00`)
        .lte('data_conclusao', `${hoje}T23:59:59`);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE,
  });
}

export function useFaturamentoHoje() {
  return useQuery({
    queryKey: ['dash-faturamento-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('valor')
        .eq('tipo', 'entrada')
        .gte('data', `${hoje}T00:00:00`)
        .lte('data', `${hoje}T23:59:59`);
      if (error) throw error;
      return (data ?? []).reduce((s, m) => s + Number(m.valor), 0);
    },
    staleTime: STALE,
  });
}

export function usePecasAlerta() {
  return useQuery({
    queryKey: ['dash-pecas-alerta'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pecas')
        .select('estoque_atual, estoque_minimo');
      if (error) throw error;
      return (data ?? []).filter(p => p.estoque_atual <= p.estoque_minimo).length;
    },
    staleTime: STALE,
  });
}

export function useTicketMedioOS() {
  return useQuery({
    queryKey: ['dash-ticket-medio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('valor_total')
        .eq('status', 'concluida');
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) return 0;
      return rows.reduce((s, o) => s + Number(o.valor_total), 0) / rows.length;
    },
    staleTime: STALE,
  });
}
