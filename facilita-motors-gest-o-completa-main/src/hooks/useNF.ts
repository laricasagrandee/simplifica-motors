import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { OSItem } from '@/types/database';

export function useListarNF(pagina = 1) {
  const POR_PAGINA = 15;
  return useQuery({
    queryKey: ['notas-fiscais', pagina],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('notas_fiscais')
        .select('*', { count: 'exact' })
        .order('emitida_em', { ascending: false })
        .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
      if (error) throw error;
      return { notas: data || [], total: count || 0, paginas: Math.ceil((count || 0) / POR_PAGINA) };
    },
  });
}

export function useNFPorId(id: string) {
  return useQuery({
    queryKey: ['nota-fiscal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export interface NFDraftFromOS {
  os_id: string;
  os_numero: number;
  tipo: 'servico' | 'produto';
  valor: number;
  destinatario_nome: string;
  destinatario_cpf_cnpj: string;
  veiculo: string;
  itens: OSItem[];
}

export function useOSParaNF(osId: string | null) {
  return useQuery({
    queryKey: ['os-para-nf', osId],
    queryFn: async (): Promise<NFDraftFromOS> => {
      const { data: os, error: osErr } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome, cpf_cnpj, telefone), motos(marca, modelo, placa)')
        .eq('id', osId!)
        .single();
      if (osErr) throw osErr;

      const { data: itens, error: itensErr } = await supabase
        .from('os_itens')
        .select('*')
        .eq('os_id', osId!)
        .order('tipo');
      if (itensErr) throw itensErr;

      const cli = os.clientes as { nome: string; cpf_cnpj: string } | null;
      const veic = os.motos as { marca: string; modelo: string; placa: string } | null;
      const hasServico = itens?.some(i => i.tipo === 'servico');
      const hasPeca = itens?.some(i => i.tipo === 'peca');

      return {
        os_id: os.id,
        os_numero: os.numero,
        tipo: hasServico && !hasPeca ? 'servico' : hasPeca && !hasServico ? 'produto' : 'servico',
        valor: os.valor_total ?? 0,
        destinatario_nome: cli?.nome ?? '',
        destinatario_cpf_cnpj: cli?.cpf_cnpj ?? '',
        veiculo: veic ? `${veic.marca} ${veic.modelo} - ${veic.placa}` : '',
        itens: (itens || []) as unknown as OSItem[],
      };
    },
    enabled: !!osId,
  });
}

interface CriarNFData {
  tipo: 'servico' | 'produto';
  os_id?: string;
  venda_pdv_id?: string;
  valor: number;
  destinatario_nome?: string;
  destinatario_cpf_cnpj?: string;
}

export function useCriarNF() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: CriarNFData) => {
      const { data, error } = await supabase.from('notas_fiscais').insert({
        tipo: d.tipo,
        os_id: d.os_id || null,
        venda_pdv_id: d.venda_pdv_id || null,
        valor: d.valor,
        destinatario_nome: d.destinatario_nome || null,
        destinatario_cpf_cnpj: d.destinatario_cpf_cnpj || null,
        emitida_em: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notas-fiscais'] }); toast({ title: 'NF emitida com sucesso!' }); },
    onError: () => toast({ title: 'Erro ao emitir NF', variant: 'destructive' }),
  });
}
