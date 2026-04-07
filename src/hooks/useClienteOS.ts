import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import type { OrdemServico } from '@/types/database';

export function useClienteOSHistory(clienteId: string) {
  const tenantId = useTenantId();
  return useQuery<OrdemServico[]>({
    queryKey: ['cliente-os-history', clienteId, tenantId],
    queryFn: async () => {
      let q = supabase.from('ordens_servico').select('*').eq('cliente_id', clienteId);
      if (tenantId) q = q.eq('tenant_id', tenantId);
      const { data, error } = await q.order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
    enabled: !!clienteId && !!tenantId,
  });
}
