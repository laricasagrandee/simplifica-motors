import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrdemServico } from '@/types/database';

export function useHistoricoVeiculo(veiculoId: string) {
  return useQuery<OrdemServico[]>({
    queryKey: ['historico-veiculo', veiculoId],
    enabled: !!veiculoId,
    queryFn: async () => {
      const { data, error } = await supabase.from('ordens_servico').select('id, numero, status, problema_relatado, valor_total, criado_em, data_conclusao, funcionarios(nome)').eq('moto_id', veiculoId).order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });
}
