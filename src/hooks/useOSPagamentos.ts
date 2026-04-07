import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { verificarCaixaAberto, atualizarCaixaEntrada } from '@/lib/caixaHelper';
import { useTenantId } from '@/hooks/useTenantId';
import { wt } from '@/lib/tenantHelper';
import { toast } from 'sonner';
import { FORMAS_PAGAMENTO } from '@/lib/constants';
import type { OSPagamento, FormaPagamento } from '@/types/database';

export function usePagamentosOS(osId: string, valorTotal: number) {
  const query = useQuery<OSPagamento[]>({
    queryKey: ['os-pagamentos', osId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_pagamentos').select('*')
        .eq('os_id', osId).order('criado_em', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as OSPagamento[];
    },
    enabled: !!osId,
  });
  const totalPago = (query.data ?? []).reduce((s, p) => s + Number(p.valor), 0);
  const restante = Math.round((valorTotal - totalPago) * 100) / 100;
  return { ...query, totalPago, restante };
}

export function useAdicionarPagamento() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (input: {
      osId: string; forma: FormaPagamento; valor: number;
      parcelas?: number; valorRecebido?: number;
    }) => {
      const troco = input.forma === 'dinheiro' && input.valorRecebido
        ? Math.max(0, input.valorRecebido - input.valor) : 0;
      const { error } = await supabase.from('os_pagamentos').insert(wt({
        os_id: input.osId, forma_pagamento: input.forma,
        valor: input.valor, parcelas: input.parcelas ?? 1,
        valor_recebido: input.valorRecebido ?? null, troco,
      }, tenantId));
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['os-pagamentos', v.osId] }),
    onError: () => toast.error('Erro ao adicionar pagamento'),
  });
}

export function useRemoverPagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, osId }: { id: string; osId: string }) => {
      const { error } = await supabase.from('os_pagamentos').delete().eq('id', id);
      if (error) throw error;
      return osId;
    },
    onSuccess: (osId) => qc.invalidateQueries({ queryKey: ['os-pagamentos', osId] }),
    onError: () => toast.error('Erro ao remover pagamento'),
  });
}

export function useFinalizarPagamento() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async ({ osId, osNumero, valorTotal, pagamentos }: {
      osId: string; osNumero: number; valorTotal: number; pagamentos: OSPagamento[];
    }) => {
      const dataHoje = new Date().toISOString().split('T')[0];

      const { data: configData } = tenantId
        ? await supabase.from('configuracoes').select('taxa_cartao_debito, taxa_cartao_credito, taxas_parcelamento').eq('id', tenantId).single()
        : await supabase.from('configuracoes').select('taxa_cartao_debito, taxa_cartao_credito, taxas_parcelamento').limit(1).single();
      const taxaDebito = Number(configData?.taxa_cartao_debito ?? 1.99);
      const taxaCreditoAvista = Number(configData?.taxa_cartao_credito ?? 3.49);
      const taxasParc = (configData?.taxas_parcelamento as Record<string, number> | null) ?? {};

      let caixa = await verificarCaixaAberto();
      if (!caixa) {
        const { data, error } = await supabase.from('caixa')
          .insert(wt({ data: dataHoje, saldo_abertura: 0, status: 'aberto', total_entradas: 0, total_saidas: 0 }, tenantId))
          .select('id, saldo_abertura, total_entradas, total_saidas').single();
        if (error) throw new Error('Não foi possível abrir o caixa');
        caixa = data;
      }

      await supabase.from('movimentacoes').delete().eq('os_id', osId);

      let totalTaxas = 0;
      for (const pag of pagamentos) {
        const isPago = pag.forma_pagamento !== 'cartao_credito';
        const label = FORMAS_PAGAMENTO[pag.forma_pagamento as FormaPagamento] || pag.forma_pagamento;
        const n = pag.parcelas ?? 1;
        const descricao = n > 1
          ? `OS-${osNumero} · ${label} ${n}x`
          : `OS-${osNumero} · ${label}`;
        const { error } = await supabase.from('movimentacoes').insert(wt({
          tipo: 'entrada', categoria: 'os_pagamento',
          descricao, valor: pag.valor, forma_pagamento: pag.forma_pagamento,
          os_id: osId, data: dataHoje, pago: isPago,
          total_parcelas: n > 1 ? n : null,
        }, tenantId));
        if (error) throw error;

        let taxaPct = 0;
        if (pag.forma_pagamento === 'cartao_debito') {
          taxaPct = taxaDebito;
        } else if (pag.forma_pagamento === 'cartao_credito') {
          taxaPct = n > 1 ? (taxasParc[String(n)] ?? 4.99) : taxaCreditoAvista;
        }
        if (taxaPct > 0) {
          const valorTaxa = Math.round(pag.valor * taxaPct) / 100;
          totalTaxas += valorTaxa;
          await supabase.from('movimentacoes').insert(wt({
            tipo: 'saida', categoria: 'taxa_cartao',
            descricao: `Taxa ${label} ${taxaPct}% · OS-${osNumero}`,
            valor: valorTaxa, forma_pagamento: pag.forma_pagamento,
            os_id: osId, data: dataHoje, pago: true,
          }, tenantId));
        }
      }

      const valorLiquido = valorTotal - totalTaxas;
      await atualizarCaixaEntrada(caixa.id, valorLiquido);

      const formaFlag = pagamentos.length === 1 ? pagamentos[0].forma_pagamento : 'multiplo';
      const { error: osErr } = await supabase.from('ordens_servico').update({
        forma_pagamento: formaFlag, parcelas: 1,
      }).eq('id', osId);
      if (osErr) throw new Error(`Erro ao marcar OS como paga: ${osErr.message}`);
    },
    onSuccess: (_, v) => {
      toast.success('Pagamento registrado com sucesso!');
      ['movimentacoes', 'financeiro-resumo', 'caixa-hoje', 'contas-receber', 'os-contadores'].forEach(
        k => qc.invalidateQueries({ queryKey: [k] })
      );
      qc.invalidateQueries({ queryKey: ['os', v.osId] });
      qc.invalidateQueries({ queryKey: ['os-pagamentos', v.osId] });
    },
    onError: (err: Error) => {
      console.error('Erro no pagamento:', err);
      toast.error(`Erro ao finalizar: ${err.message}`);
    },
  });
}
