import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

const STALE_TIME = 30_000;

export function useOSAbertas() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dashboard-os-abertas', tenantId],
    queryFn: async () => {
      const q = supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).not('status', 'in', '("entregue","cancelada")');
      const { count, error } = await tf(q, tenantId);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
  });
}

export function useOSConcluidasHoje() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dashboard-os-concluidas-hoje', tenantId],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const q = supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).eq('status', 'concluida').gte('data_conclusao', `${hoje}T00:00:00`).lte('data_conclusao', `${hoje}T23:59:59`);
      const { count, error } = await tf(q, tenantId);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
  });
}

export function useFaturamentoHoje() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dashboard-faturamento-hoje', tenantId],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const q = supabase.from('movimentacoes').select('valor').eq('tipo', 'entrada').gte('data', `${hoje}T00:00:00`).lte('data', `${hoje}T23:59:59`);
      const { data, error } = await tf(q, tenantId);
      if (error) throw error;
      return (data ?? []).reduce((sum: number, m: any) => sum + Number(m.valor), 0);
    },
    staleTime: STALE_TIME,
  });
}
