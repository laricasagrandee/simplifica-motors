import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeEmail, sanitizeNumeric, FIELD_LIMITS } from '@/lib/sanitize';
import { registrarLog } from '@/hooks/useAuditLog';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import type { Cliente } from '@/types/database';

const PER_PAGE = 10;

export function useListarClientes(busca = '', pagina = 1, apenasCompletos = false) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['clientes', busca, pagina, apenasCompletos, tenantId],
    queryFn: async () => {
      const from = (pagina - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;

      let query = tf(supabase
        .from('clientes')
        .select('*, motos(id, placa)', { count: 'exact' })
        .order('nome', { ascending: true })
        .range(from, to), tenantId);

      if (apenasCompletos) {
        query = query.or('telefone.neq.,cpf_cnpj.neq.');
      }

      if (busca.trim()) {
        const term = `%${busca.trim()}%`;
        query = query.or(`nome.ilike.${term},telefone.ilike.${term},cpf_cnpj.ilike.${term}`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      let clientes = (data ?? []).map((c: any) => {
        const { motos, ...rest } = c;
        return {
          ...rest,
          motos_count: Array.isArray(motos) ? motos.length : 0,
          _motos: motos,
        };
      });

      if (busca.trim() && clientes.length === 0) {
        const placaQuery = tf(supabase
          .from('motos')
          .select('cliente_id')
          .ilike('placa', `%${busca.trim()}%`), tenantId);
        const { data: placaData } = await placaQuery;
        if (placaData && placaData.length > 0) {
          const clienteIds = [...new Set(placaData.map((p: any) => p.cliente_id))] as string[];
          const clienteQuery = tf(supabase
            .from('clientes')
            .select('*, motos(id, placa)', { count: 'exact' })
            .in('id', clienteIds)
            .order('nome', { ascending: true })
            .range(from, to), tenantId);
          const { data: clientesByPlaca, count: countByPlaca } = await clienteQuery;
          if (clientesByPlaca) {
            clientes = clientesByPlaca.map((c: any) => {
              const { motos, ...rest } = c;
              return { ...rest, motos_count: Array.isArray(motos) ? motos.length : 0, _motos: motos };
            });
            return { data: clientes as unknown as (Cliente & { motos_count: number })[], total: countByPlaca ?? 0 };
          }
        }
      }

      return { data: clientes as unknown as (Cliente & { motos_count: number })[], total: count ?? 0 };
    },
    staleTime: 30_000,
    enabled: !!tenantId,
  });
}

export function useClientePorId(id: string) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*, motos(id)')
        .eq('id', id)
        .single();
      if (error) throw error;

      const motos_count = Array.isArray(data.motos) ? data.motos.length : 0;

      const { data: osData } = await tf(supabase
        .from('ordens_servico')
        .select('valor_total')
        .eq('cliente_id', id)
        .eq('status', 'entregue'), tenantId);
      const total_gasto = (osData ?? []).reduce((s: number, o: any) => s + Number(o.valor_total), 0);

      return { ...data, motos: undefined, motos_count, total_gasto } as unknown as Cliente & { motos_count: number; total_gasto: number };
    },
    enabled: !!id,
  });
}

function sanitizeCliente(input: Record<string, string | null>) {
  return {
    nome: sanitizeInput(input.nome ?? '', FIELD_LIMITS.nome),
    cpf_cnpj: input.cpf_cnpj ? sanitizeNumeric(input.cpf_cnpj).slice(0, 14) : null,
    telefone: input.telefone ? sanitizeNumeric(input.telefone).slice(0, 11) : null,
    email: input.email ? sanitizeEmail(input.email) : null,
    data_nascimento: input.data_nascimento || null,
    endereco_cep: input.cep ? sanitizeNumeric(input.cep).slice(0, 8) : null,
    endereco_rua: input.rua ? sanitizeInput(input.rua, FIELD_LIMITS.nome) : null,
    endereco_numero: input.numero ? sanitizeInput(input.numero, 20) : null,
    endereco_bairro: input.bairro ? sanitizeInput(input.bairro, FIELD_LIMITS.nome) : null,
    endereco_cidade: input.cidade ? sanitizeInput(input.cidade, FIELD_LIMITS.nome) : null,
    endereco_estado: input.estado ? sanitizeInput(input.estado, 2) : null,
  };
}

export function useCriarCliente() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (input: Record<string, string | null>) => {
      const clean = sanitizeCliente(input);
      const { data, error } = await supabase.from('clientes').insert(wt(clean, tenantId)).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      registrarLog({ acao: 'criar', tabela: 'clientes', registroId: data.id, dadosDepois: data });
      qc.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useEditarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Record<string, string | null>) => {
      const clean = sanitizeCliente(input);
      const { data, error } = await supabase.from('clientes').update(clean).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, vars) => {
      registrarLog({ acao: 'editar', tabela: 'clientes', registroId: vars.id, dadosDepois: data });
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['cliente', vars.id] });
    },
  });
}

export function useDeletarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      registrarLog({ acao: 'excluir', tabela: 'clientes', registroId: id });
      qc.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}
