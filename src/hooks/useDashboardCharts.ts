import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';
import type { StatusOS } from '@/types/database';

const STALE_TIME = 30_000;

export interface FaturamentoDia { data: string; valor: number; }

export function useFaturamentoSemanal() {
  const tenantId = useTenantId();
  return useQuery<FaturamentoDia[]>({
    queryKey: ['dashboard-faturamento-semanal', tenantId],
    queryFn: async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const startStr = start.toISOString().split('T')[0];
      const q = supabase.from('movimentacoes').select('data, valor').eq('tipo', 'entrada').gte('data', `${startStr}T00:00:00`);
      const { data, error } = await tf(q, tenantId);
      if (error) throw error;
      const map = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        map.set(d.toISOString().split('T')[0], 0);
      }
      (data ?? []).forEach((m: any) => {
        const day = m.data.split('T')[0];
        map.set(day, (map.get(day) ?? 0) + Number(m.valor));
      });
      return Array.from(map.entries()).map(([data, valor]) => ({ data, valor }));
    },
    staleTime: STALE_TIME,
  });
}

export interface OSStatusCount { status: StatusOS; count: number; }

export function useOSPorStatus() {
  const tenantId = useTenantId();
  return useQuery<OSStatusCount[]>({
    queryKey: ['dashboard-os-por-status', tenantId],
    queryFn: async () => {
      const q = supabase.from('ordens_servico').select('status');
      const { data, error } = await tf(q, tenantId);
      if (error) throw error;
      const counts = new Map<string, number>();
      (data ?? []).forEach((os: any) => { counts.set(os.status, (counts.get(os.status) ?? 0) + 1); });
      return Array.from(counts.entries()).map(([status, count]) => ({ status: status as StatusOS, count }));
    },
    staleTime: STALE_TIME,
  });
}
