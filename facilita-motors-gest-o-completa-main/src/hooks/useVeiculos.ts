import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, FIELD_LIMITS } from '@/lib/sanitize';
import type { Veiculo, OrdemServico } from '@/types/database';

const PER_PAGE = 15;

export function useListarVeiculos(busca = '', pagina = 1) {
  return useQuery({
    queryKey: ['veiculos-todos', busca, pagina],
    queryFn: async () => {
      const from = (pagina - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;
      let query = supabase
        .from('motos')
        .select('*, clientes(nome, telefone)', { count: 'exact' })
        .order('criado_em', { ascending: false })
        .range(from, to);
      if (busca.trim()) {
        const t = `%${busca.trim()}%`;
        query = query.or(`placa.ilike.${t},modelo.ilike.${t},marca.ilike.${t}`);
      }
      const { data, count, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as unknown as (Veiculo & { clientes: { nome: string; telefone: string } | null })[], total: count ?? 0 };
    },
    staleTime: 30_000,
  });
}

export function useVeiculosPorCliente(clienteId: string) {
  return useQuery<Veiculo[]>({
    queryKey: ['veiculos', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Veiculo[];
    },
    enabled: !!clienteId,
  });
}

function sanitizeVeiculo(input: Record<string, string | number | null>, clienteId: string) {
  return {
    cliente_id: clienteId,
    marca: input.marca ? sanitizeInput(String(input.marca), 50) : '',
    modelo: input.modelo ? sanitizeInput(String(input.modelo), FIELD_LIMITS.modelo) : '',
    ano: input.ano ? Number(input.ano) : null,
    cor: input.cor ? sanitizeInput(String(input.cor), FIELD_LIMITS.cor) : null,
    placa: input.placa ? sanitizeInput(String(input.placa), FIELD_LIMITS.placa).toUpperCase() : '',
    quilometragem: input.quilometragem ? Number(input.quilometragem) : null,
  };
}

export function useCriarVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clienteId, ...input }: { clienteId: string } & Record<string, string | number | null>) => {
      const clean = sanitizeVeiculo(input, clienteId);
      const { data, error } = await supabase.from('motos').insert(clean).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['veiculos', vars.clienteId] }),
  });
}

export function useEditarVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clienteId, ...input }: { id: string; clienteId: string } & Record<string, string | number | null>) => {
      const clean = sanitizeVeiculo(input, clienteId);
      const { data, error } = await supabase.from('motos').update(clean).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['veiculos', vars.clienteId] }),
  });
}

export function useDeletarVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clienteId }: { id: string; clienteId: string }) => {
      const { error } = await supabase.from('motos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['veiculos', vars.clienteId] }),
  });
}

export function useHistoricoOSVeiculo(veiculoId: string) {
  return useQuery<OrdemServico[]>({
    queryKey: ['historico-os-veiculo', veiculoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome)')
        .eq('moto_id', veiculoId)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
    enabled: !!veiculoId,
  });
}
