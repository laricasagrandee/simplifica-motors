import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Periodo { dataInicio: string; dataFim: string; }

export function useComissaoTodosMecanicos(p: Periodo) {
  return useQuery({
    queryKey: ['comissao-todos', p],
    queryFn: async () => {
      const { data: funcs } = await supabase.from('funcionarios').select('id, nome, comissao_percentual').eq('cargo', 'mecanico').eq('ativo', true);
      if (!funcs?.length) return [];
      const result: { id: string; nome: string; osConcluidas: number; maoObra: number; comissaoPct: number; comissao: number }[] = [];
      for (const f of funcs) {
        const { data: os } = await supabase.from('ordens_servico').select('valor_mao_obra')
          .eq('mecanico_id', f.id).in('status', ['concluida', 'entregue'])
          .gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
        const maoObra = (os || []).reduce((s, o) => s + Number(o.valor_mao_obra || 0), 0);
        const pct = Number(f.comissao_percentual || 0);
        result.push({ id: f.id, nome: f.nome, osConcluidas: os?.length || 0, maoObra, comissaoPct: pct, comissao: maoObra * pct / 100 });
      }
      return result.sort((a, b) => b.comissao - a.comissao);
    },
  });
}

export function useRegistrarComissao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, valor }: { nome: string; valor: number }) => {
      const { error } = await supabase.from('movimentacoes').insert({
        tipo: 'saida',
        categoria: 'comissao',
        descricao: `Comissão - ${nome}`,
        valor,
        forma_pagamento: 'pix',
        data: new Date().toISOString().slice(0, 10),
        pago: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
      toast({ title: 'Comissão registrada!' });
    },
  });
}
