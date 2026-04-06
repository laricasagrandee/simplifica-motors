import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useContasReceber() {
  return useQuery({
    queryKey: ['contas-receber'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('tipo', 'entrada')
        .eq('pago', false)
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
