import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

export function useContasPagar() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['contas-pagar', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('movimentacoes').select('*').eq('tipo', 'saida').eq('pago', false).order('data_vencimento', { ascending: true }), tenantId);
      if (error) throw error;
      return data || [];
    },
  });
}
