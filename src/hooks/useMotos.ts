import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeNumeric, FIELD_LIMITS } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { withTenant } from '@/lib/tenantHelper';
import type { Moto, OrdemServico } from '@/types/database';

export function useMotosPorCliente(clienteId: string) {
  const tenantId = useTenantId();
  return useQuery<Moto[]>({
    queryKey: ['motos', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('motos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('criado_em', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Moto[];
    },
    enabled: !!clienteId,
  });
}

function sanitizeMoto(input: Record<string, string | number | null>, clienteId: string) {
  return {
    cliente_id: clienteId,
    marca: sanitizeInput(String(input.marca ?? ''), 50),
    modelo: sanitizeInput(String(input.modelo ?? ''), FIELD_LIMITS.modelo),
    ano: input.ano ? Number(input.ano) : null,
    cor: input.cor ? sanitizeInput(String(input.cor), FIELD_LIMITS.cor) : null,
    placa: input.placa ? sanitizeInput(String(input.placa), FIELD_LIMITS.placa).toUpperCase() : '',
    quilometragem: input.quilometragem ? Number(input.quilometragem) : null,
  };
}

export function useCriarMoto() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async ({ clienteId, ...input }: { clienteId: string } & Record<string, string | number | null>) => {
      const clean = sanitizeMoto(input, clienteId);
      const { data, error } = await supabase.from('motos').insert(withTenant(clean, tenantId)).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['motos', vars.clienteId] }),
  });
}

export function useEditarMoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clienteId, ...input }: { id: string; clienteId: string } & Record<string, string | number | null>) => {
      const clean = sanitizeMoto(input, clienteId);
      const { data, error } = await supabase.from('motos').update(clean).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['motos', vars.clienteId] }),
  });
}

export function useDeletarMoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clienteId }: { id: string; clienteId: string }) => {
      const { error } = await supabase.from('motos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['motos', vars.clienteId] }),
  });
}

export function useHistoricoOS(motoId: string) {
  const tenantId = useTenantId();
  return useQuery<OrdemServico[]>({
    queryKey: ['historico-os-moto', motoId],
    queryFn: async () => {
      let query = supabase
        .from('ordens_servico')
        .select('*, clientes(nome)')
        .eq('moto_id', motoId)
        .order('criado_em', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
    enabled: !!motoId,
  });
}
