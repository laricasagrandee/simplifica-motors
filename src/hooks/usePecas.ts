import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeNumeric, sanitizeMonetary, sanitizeQuantity, FIELD_LIMITS } from '@/lib/sanitize';
import { registrarLog } from '@/hooks/useAuditLog';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import type { Peca, CategoriaPeca } from '@/types/database';

const PER_PAGE = 15;

export function useListarPecas(busca = '', categoria?: CategoriaPeca | '', apenasAlerta = false, pagina = 1) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['pecas', busca, categoria, apenasAlerta, pagina, tenantId],
    queryFn: async () => {
      const from = (pagina - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;
      let query: any = tf(supabase.from('pecas').select('*', { count: 'exact' }).order('nome', { ascending: true }).range(from, to), tenantId);
      if (busca.trim()) { const term = `%${busca.trim()}%`; query = query.or(`nome.ilike.${term},codigo.ilike.${term}`); }
      if (categoria) query = query.eq('categoria', categoria);
      if (apenasAlerta) query = query.lte('estoque_atual', supabase.rpc ? 0 : 0);
      const { data, count, error } = await query;
      if (error) throw error;
      let pecas = (data ?? []) as Peca[];
      if (apenasAlerta) pecas = pecas.filter((p) => p.estoque_atual <= p.estoque_minimo);
      return { data: pecas, total: count ?? 0 };
    },
    staleTime: 30_000,
    enabled: !!tenantId,
  });
}

export function usePecaPorId(id: string) {
  return useQuery<Peca>({
    queryKey: ['peca', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('pecas').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Peca;
    },
    enabled: !!id,
  });
}

export function useResumoPecas() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['pecas-resumo', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('pecas').select('estoque_atual, estoque_minimo, preco_custo'), tenantId);
      if (error) throw error;
      const pecas = data ?? [];
      return {
        totalPecas: pecas.length,
        valorEstoque: pecas.reduce((s: number, p: any) => s + p.estoque_atual * p.preco_custo, 0),
        qtdAlerta: pecas.filter((p: any) => p.estoque_atual <= p.estoque_minimo).length,
      };
    },
    staleTime: 30_000,
  });
}

function sanitizePeca(input: Record<string, string | number | null>) {
  return {
    nome: sanitizeInput(String(input.nome ?? ''), FIELD_LIMITS.nome),
    codigo: input.codigo ? sanitizeInput(String(input.codigo), FIELD_LIMITS.codigo) : null,
    marca: input.marca ? sanitizeInput(String(input.marca), 100) : null,
    categoria: input.categoria as CategoriaPeca,
    unidade: sanitizeInput(String(input.unidade ?? 'un'), 20),
    preco_custo: sanitizeMonetary(Number(input.preco_custo ?? 0)),
    preco_venda: sanitizeMonetary(Number(input.preco_venda ?? 0)),
    estoque_atual: sanitizeQuantity(Number(input.estoque_atual ?? 0)),
    estoque_minimo: sanitizeQuantity(Number(input.estoque_minimo ?? 0)),
  };
}

export function useCriarPeca() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (input: Record<string, string | number | null>) => {
      const clean = sanitizePeca(input);
      const { data, error } = await supabase.from('pecas').insert(wt(clean, tenantId)).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      registrarLog({ acao: 'criar', tabela: 'pecas', registroId: data.id, dadosDepois: data });
      qc.invalidateQueries({ queryKey: ['pecas'] }); qc.invalidateQueries({ queryKey: ['pecas-resumo'] });
    },
  });
}

export function useEditarPeca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Record<string, string | number | null>) => {
      const clean = sanitizePeca(input);
      const { data, error } = await supabase.from('pecas').update(clean).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, vars) => {
      registrarLog({ acao: 'editar', tabela: 'pecas', registroId: vars.id, dadosDepois: data });
      qc.invalidateQueries({ queryKey: ['pecas'] }); qc.invalidateQueries({ queryKey: ['peca', vars.id] }); qc.invalidateQueries({ queryKey: ['pecas-resumo'] });
    },
  });
}

export function useDeletarPeca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pecas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      registrarLog({ acao: 'excluir', tabela: 'pecas', registroId: id });
      qc.invalidateQueries({ queryKey: ['pecas'] }); qc.invalidateQueries({ queryKey: ['pecas-resumo'] });
    },
  });
}
