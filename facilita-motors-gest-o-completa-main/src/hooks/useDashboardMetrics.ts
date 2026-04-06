import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME = 30_000;

export function useOSAbertas() {
  return useQuery({
    queryKey: ['dashboard-os-abertas'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("entregue","cancelada")');
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
  });
}

export function useOSConcluidasHoje() {
  return useQuery({
    queryKey: ['dashboard-os-concluidas-hoje'],
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
    staleTime: STALE_TIME,
  });
}

export function useFaturamentoHoje() {
  return useQuery({
    queryKey: ['dashboard-faturamento-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('valor')
        .eq('tipo', 'entrada')
        .gte('data', `${hoje}T00:00:00`)
        .lte('data', `${hoje}T23:59:59`);
      if (error) throw error;
      return (data ?? []).reduce((sum, m) => sum + Number(m.valor), 0);
    },
    staleTime: STALE_TIME,
  });
}
