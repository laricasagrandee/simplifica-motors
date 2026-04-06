import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrdemServico } from '@/types/database';

export function useClienteOSHistory(clienteId: string) {
  return useQuery<OrdemServico[]>({
    queryKey: ['cliente-os-history', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
    enabled: !!clienteId,
  });
}
