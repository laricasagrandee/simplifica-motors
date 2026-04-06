import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME = 30_000;

export function usePecasAlerta() {
  return useQuery({
    queryKey: ['dashboard-pecas-alerta'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pecas')
        .select('id, estoque_atual, estoque_minimo')
        .filter('estoque_atual', 'lte', 'estoque_minimo' as never);
      if (error) {
        // Fallback: fetch all and filter client-side
        const { data: all, error: e2 } = await supabase
          .from('pecas')
          .select('id, estoque_atual, estoque_minimo');
        if (e2) throw e2;
        return (all ?? []).filter((p) => p.estoque_atual <= p.estoque_minimo).length;
      }
      return (data ?? []).length;
    },
    staleTime: STALE_TIME,
  });
}

export function useTicketMedio() {
  return useQuery({
    queryKey: ['dashboard-ticket-medio'],
    queryFn: async () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('valor_total')
        .in('status', ['concluida', 'entregue'])
        .gte('created_at', firstDay);
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      const total = data.reduce((sum, os) => sum + Number(os.valor_total), 0);
      return total / data.length;
    },
    staleTime: STALE_TIME,
  });
}
