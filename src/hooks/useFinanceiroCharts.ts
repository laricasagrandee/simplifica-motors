import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

export function useFluxoPorDia(dataInicio: string, dataFim: string) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['financeiro-fluxo', dataInicio, dataFim, tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('movimentacoes').select('data, tipo, valor').gte('data', dataInicio).lte('data', dataFim).eq('pago', true), tenantId);
      if (error) throw error;
      const map = new Map<string, { data: string; entradas: number; saidas: number }>();
      (data || []).forEach((m: any) => {
        const d = m.data?.slice(0, 10) || '';
        if (!map.has(d)) map.set(d, { data: d, entradas: 0, saidas: 0 });
        const entry = map.get(d)!;
        if (m.tipo === 'entrada') entry.entradas += Number(m.valor);
        else entry.saidas += Number(m.valor);
      });
      return Array.from(map.values()).sort((a, b) => a.data.localeCompare(b.data));
    },
  });
}
