import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const hoje = () => format(new Date(), 'yyyy-MM-dd');

export function useCaixaHoje() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['caixa-hoje', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('caixa').select('*').eq('data', hoje()), tenantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAbrirCaixa() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (saldoAbertura: number) => {
      const d = hoje();
      const { data: existing } = await tf(supabase.from('caixa').select('id').eq('data', d), tenantId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('caixa').update({ saldo_abertura: saldoAbertura, status: 'aberto', total_entradas: 0, total_saidas: 0, saldo_fechamento: 0, fechado_em: null, fechado_por: null }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('caixa').insert(wt({ data: d, saldo_abertura: saldoAbertura, status: 'aberto', total_entradas: 0, total_saidas: 0 }, tenantId));
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caixa-hoje'] }); qc.invalidateQueries({ queryKey: ['historico-caixa'] }); toast({ title: 'Caixa aberto!' }); },
    onError: () => toast({ title: 'Erro ao abrir caixa', variant: 'destructive' }),
  });
}

export function useFecharCaixa() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async (caixaId: string) => {
      const d = hoje();
      const { data: movs } = await tf(supabase.from('movimentacoes').select('tipo, valor').eq('pago', true).gte('data', `${d}T00:00:00`).lte('data', `${d}T23:59:59`), tenantId);
      const entradas = (movs || []).filter((m: any) => m.tipo === 'entrada').reduce((s: number, m: any) => s + Number(m.valor), 0);
      const saidas = (movs || []).filter((m: any) => m.tipo === 'saida').reduce((s: number, m: any) => s + Number(m.valor), 0);
      const { data: caixa } = await supabase.from('caixa').select('saldo_abertura').eq('id', caixaId).single();
      const saldo = (caixa?.saldo_abertura || 0) + entradas - saidas;
      const { error } = await supabase.from('caixa').update({ status: 'fechado', total_entradas: entradas, total_saidas: saidas, saldo_fechamento: saldo }).eq('id', caixaId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caixa-hoje'] }); qc.invalidateQueries({ queryKey: ['historico-caixa'] }); toast({ title: 'Caixa fechado!' }); },
  });
}

export function useHistoricoCaixa() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['historico-caixa', tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('caixa').select('*').order('data', { ascending: false }).limit(7), tenantId);
      if (error) throw error;
      return data || [];
    },
  });
}
