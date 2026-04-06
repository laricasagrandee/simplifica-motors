import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useContasPagar() {
  return useQuery({
    queryKey: ['contas-pagar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('tipo', 'saida')
        .eq('pago', false)
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
