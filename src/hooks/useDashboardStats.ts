import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

const STALE = 30_000;

export function useOSAbertas() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dash-os-abertas', tenantId],
    queryFn: async () => {
      const { count, error } = await tf(supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).not('status', 'in', '("entregue","cancelada")'), tenantId);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE,
  });
}

export function useOSConcluidasHoje() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dash-os-concluidas-hoje', tenantId],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { count, error } = await tf(supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).eq('status', 'concluida').gte('data_conclusao', `${hoje}T00:00:00`).lte('data_conclusao', `${hoje}T23:59:59`), tenantId);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE,
  });
}

export function useFaturamentoHoje() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dash-faturamento-hoje', tenantId],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await tf(supabase.from('movimentacoes').select('valor').eq('tipo', 'entrada').gte('data', `${hoje}T00:00:00`).lte('data', `${hoje}T23:59:59`), tenantId);
      if (error) throw error;
      return (data ?? []).reduce((s: number, m: any) => s + Number(m.valor), 0);
    },
    staleTime: STALE,
  });
}

export function usePecasAlerta() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dash-pecas-alerta', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('pecas').select('estoque_atual, estoque_minimo'), tenantId);
      if (error) throw error;
      return (data ?? []).filter((p: any) => p.estoque_atual <= p.estoque_minimo).length;
    },
    staleTime: STALE,
  });
}

export function useTicketMedioOS() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dash-ticket-medio', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('ordens_servico').select('valor_total').eq('status', 'concluida'), tenantId);
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) return 0;
      return rows.reduce((s: number, o: any) => s + Number(o.valor_total), 0) / rows.length;
    },
    staleTime: STALE,
  });
}
