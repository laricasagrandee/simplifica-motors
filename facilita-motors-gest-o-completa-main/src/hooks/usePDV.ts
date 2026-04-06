import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeMonetary } from '@/lib/sanitize';
import { verificarCaixaAberto, atualizarCaixaEntrada } from '@/lib/caixaHelper';
import { toast } from 'sonner';
import type { FormaPagamento } from '@/types/database';

interface CriarVendaInput {
  cliente_id: string | null;
  itens: { peca_id: string; quantidade: number; valor_unitario: number }[];
  desconto: number;
  forma_pagamento: FormaPagamento;
  parcelas: number;
  valor_total: number;
  observacao?: string;
}

export function useCriarVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarVendaInput) => {
      // Verificar caixa aberto
      const caixa = await verificarCaixaAberto();
      if (!caixa) {
        throw new Error('CAIXA_FECHADO');
      }

      const { data: venda, error: vendaErr } = await supabase
        .from('vendas_pdv')
        .insert({
          cliente_id: input.cliente_id,
          valor_total: sanitizeMonetary(input.valor_total),
          desconto: sanitizeMonetary(input.desconto),
          forma_pagamento: input.forma_pagamento,
          parcelas: input.parcelas,
        })
        .select()
        .single();
      if (vendaErr) throw vendaErr;

      const itens = input.itens.map((i) => ({
        venda_id: venda.id,
        peca_id: i.peca_id,
        descricao: '',
        quantidade: i.quantidade,
        valor_unitario: sanitizeMonetary(i.valor_unitario),
        valor_total: sanitizeMonetary(i.quantidade * i.valor_unitario),
      }));

      const { error: itensErr } = await supabase.from('vendas_pdv_itens').insert(itens);
      if (itensErr) throw itensErr;

      for (const item of input.itens) {
        const { data: peca } = await supabase
          .from('pecas')
          .select('estoque_atual')
          .eq('id', item.peca_id)
          .single();
        if (peca) {
          await supabase
            .from('pecas')
            .update({ estoque_atual: Math.max(0, (peca.estoque_atual ?? 0) - item.quantidade) })
            .eq('id', item.peca_id);
        }
      }

      const desc = input.observacao
        ? sanitizeInput(input.observacao, 500)
        : `Venda PDV - ${input.itens.length} itens`;

      await supabase.from('movimentacoes').insert({
        tipo: 'entrada',
        categoria: 'venda_pdv',
        descricao: desc,
        valor: sanitizeMonetary(input.valor_total),
        forma_pagamento: input.forma_pagamento,
        venda_pdv_id: venda.id,
        data: new Date().toISOString(),
      });

      await atualizarCaixaEntrada(caixa.id, sanitizeMonetary(input.valor_total));

      return venda;
    },
    onError: (err: Error) => {
      if (err.message === 'CAIXA_FECHADO') {
        toast.error('Abra o caixa antes de registrar vendas. Vá para Financeiro → Caixa.');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pecas'] });
      qc.invalidateQueries({ queryKey: ['pecas-resumo'] });
      qc.invalidateQueries({ queryKey: ['vendas-pdv'] });
      qc.invalidateQueries({ queryKey: ['caixa'] });
    },
  });
}

export function useHistoricoVendas(pagina = 1) {
  return useQuery({
    queryKey: ['vendas-pdv', pagina],
    queryFn: async () => {
      const from = (pagina - 1) * 15;
      const to = from + 14;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const { data, count, error } = await supabase
        .from('vendas_pdv')
        .select('*, clientes(nome)', { count: 'exact' })
        .gte('criado_em', hoje.toISOString())
        .order('criado_em', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
    staleTime: 10_000,
  });
}
