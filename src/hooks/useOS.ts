import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, FIELD_LIMITS } from '@/lib/sanitize';
import type { OrdemServico, StatusOS } from '@/types/database';

const PER_PAGE = 15;

export interface OSFiltros {
  status?: StatusOS | '';
  busca?: string;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
}

export function useListarOS(filtros: OSFiltros = {}) {
  const { status, busca, dataInicio, dataFim, pagina = 1 } = filtros;
  return useQuery({
    queryKey: ['ordens-servico', status, busca, dataInicio, dataFim, pagina],
    queryFn: async () => {
      const from = (pagina - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;

      let query = supabase
        .from('ordens_servico')
        .select('*, clientes(nome, telefone), motos(marca, modelo, placa), funcionarios(nome)', { count: 'exact' })
        .order('criado_em', { ascending: false })
        .range(from, to);

      if (status) query = query.eq('status', status);
      if (busca?.trim()) {
        const term = `%${busca.trim()}%`;
        query = query.or(`problema_relatado.ilike.${term}`);
      }
      if (dataInicio) query = query.gte('criado_em', dataInicio);
      if (dataFim) query = query.lte('criado_em', dataFim + 'T23:59:59');

      const { data, count, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as unknown as OrdemServico[], total: count ?? 0 };
    },
    staleTime: 30_000,
  });
}

export function useContadoresOS() {
  return useQuery({
    queryKey: ['os-contadores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ordens_servico').select('status');
      if (error) throw error;
      const all = data ?? [];
      const count = (s: string) => all.filter((o) => o.status === s).length;
      return {
        aberta: count('aberta'),
        em_orcamento: count('em_orcamento'),
        aprovada: count('aprovada'),
        em_execucao: count('em_execucao'),
        concluida: count('concluida'),
        entregue: count('entregue'),
        cancelada: count('cancelada'),
        total: all.length,
      };
    },
    staleTime: 30_000,
  });
}

export function useProximoNumeroOS() {
  return useQuery({
    queryKey: ['proximo-numero-os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('numero')
        .order('numero', { ascending: false })
        .limit(1);
      if (error) throw error;
      const last = data?.[0]?.numero ?? 0;
      return String(Number(last) + 1);
    },
  });
}

interface CriarOSInput {
  clienteId: string;
  motoId: string;
  problemaRelatado?: string;
  funcionarioId?: string;
  observacoes?: string;
  quilometragem?: number;
}

export function useCriarOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarOSInput) => {
      const { data, error } = await supabase.from('ordens_servico').insert({
        cliente_id: input.clienteId,
        moto_id: input.motoId,
        mecanico_id: input.funcionarioId || null,
        status: 'aberta',
        problema_relatado: input.problemaRelatado ? sanitizeInput(input.problemaRelatado, FIELD_LIMITS.texto_livre) : '',
        diagnostico: input.observacoes ? sanitizeInput(input.observacoes, FIELD_LIMITS.texto_livre) : null,
        valor_pecas: 0,
        valor_mao_obra: 0,
        desconto: 0,
        valor_total: 0,
        parcelas: 1,
      }).select().single();
      if (error) throw error;

      if (input.quilometragem && input.quilometragem > 0) {
        await supabase.from('motos').update({ quilometragem: input.quilometragem }).eq('id', input.motoId);
      }

      return data as unknown as OrdemServico;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
      qc.invalidateQueries({ queryKey: ['os-contadores'] });
      qc.invalidateQueries({ queryKey: ['proximo-numero-os'] });
    },
  });
}
