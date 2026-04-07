import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import type { OrdemServico } from '@/types/database';

export function useHistoricoVeiculo(veiculoId: string) {
  const tenantId = useTenantId();
  return useQuery<OrdemServico[]>({
    queryKey: ['historico-veiculo', veiculoId, tenantId],
    enabled: !!veiculoId && !!tenantId,
    queryFn: async () => {
      let q = supabase.from('ordens_servico').select('id, numero, status, problema_relatado, valor_total, criado_em, data_conclusao, funcionarios(nome)').eq('moto_id', veiculoId);
      if (tenantId) q = q.eq('tenant_id', tenantId);
      const { data, error } = await q.order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });
}
