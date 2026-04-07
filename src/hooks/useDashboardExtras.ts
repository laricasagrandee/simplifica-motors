import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

const STALE_TIME = 30_000;

export function usePecasAlerta() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dashboard-pecas-alerta', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('pecas').select('id, estoque_atual, estoque_minimo'), tenantId);
      if (error) throw error;
      return (data ?? []).filter((p: any) => p.estoque_atual <= p.estoque_minimo).length;
    },
    staleTime: STALE_TIME,
  });
}

export function useTicketMedio() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dashboard-ticket-medio', tenantId],
    queryFn: async () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data, error } = await tf(supabase.from('ordens_servico').select('valor_total').in('status', ['concluida', 'entregue']).gte('created_at', firstDay), tenantId);
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      const total = data.reduce((sum: number, os: any) => sum + Number(os.valor_total), 0);
      return total / data.length;
    },
    staleTime: STALE_TIME,
  });
}
