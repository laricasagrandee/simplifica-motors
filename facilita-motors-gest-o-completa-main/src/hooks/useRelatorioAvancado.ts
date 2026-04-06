import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Periodo { dataInicio: string; dataFim: string; }

export function useLucratividadePorServico(p: Periodo) {
  return useQuery({
    queryKey: ['rel-lucratividade-servico', p],
    queryFn: async () => {
      const { data } = await supabase
        .from('os_itens')
        .select('descricao, quantidade, valor_total, criado_em')
        .eq('tipo', 'servico')
        .gte('criado_em', p.dataInicio)
        .lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { descricao: string; receita: number; quantidade: number }>();
      (data ?? []).forEach((i) => {
        const cur = map.get(i.descricao) ?? { descricao: i.descricao, receita: 0, quantidade: 0 };
        cur.receita += Number(i.valor_total);
        cur.quantidade += i.quantidade;
        map.set(i.descricao, cur);
      });
      return Array.from(map.values()).sort((a, b) => b.receita - a.receita);
    },
  });
}

export function useTempoMedioOS(p: Periodo) {
  return useQuery({
    queryKey: ['rel-tempo-medio-os', p],
    queryFn: async () => {
      const { data } = await supabase
        .from('ordens_servico')
        .select('criado_em, data_conclusao')
        .in('status', ['concluida', 'entregue'])
        .not('data_conclusao', 'is', null)
        .gte('criado_em', p.dataInicio)
        .lte('criado_em', p.dataFim + 'T23:59:59');
      if (!data?.length) return { tempoMedio: 0, maiorTempo: 0, menorTempo: 0, total: 0 };
      const tempos = data.map((os) => {
        const diff = new Date(os.data_conclusao!).getTime() - new Date(os.criado_em!).getTime();
        return Math.max(0, diff / 86400000);
      });
      const soma = tempos.reduce((a, b) => a + b, 0);
      return {
        tempoMedio: Math.round((soma / tempos.length) * 10) / 10,
        maiorTempo: Math.round(Math.max(...tempos) * 10) / 10,
        menorTempo: Math.round(Math.min(...tempos) * 10) / 10,
        total: tempos.length,
      };
    },
  });
}

export function useReceitaPorFormaPagamento(p: Periodo) {
  return useQuery({
    queryKey: ['rel-receita-forma-pgto', p],
    queryFn: async () => {
      const { data } = await supabase
        .from('movimentacoes')
        .select('forma_pagamento, valor')
        .eq('tipo', 'entrada')
        .eq('pago', true)
        .gte('data', p.dataInicio)
        .lte('data', p.dataFim + 'T23:59:59');
      const map = new Map<string, number>();
      (data ?? []).forEach((m) => {
        const forma = m.forma_pagamento || 'Outros';
        map.set(forma, (map.get(forma) || 0) + Number(m.valor));
      });
      const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
      return Array.from(map.entries())
        .map(([forma, valor]) => ({ forma, valor, percentual: total > 0 ? Math.round((valor / total) * 1000) / 10 : 0 }))
        .sort((a, b) => b.valor - a.valor);
    },
  });
}
