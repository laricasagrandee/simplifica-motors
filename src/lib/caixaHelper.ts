import { supabase } from '@/integrations/supabase/client';

export async function verificarCaixaAberto() {
  const hoje = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('caixa')
    .select('id, saldo_abertura, total_entradas, total_saidas')
    .eq('data', hoje)
    .eq('status', 'aberto')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function atualizarCaixaEntrada(caixaId: string, valor: number) {
  const { data: caixa, error: fetchErr } = await supabase
    .from('caixa')
    .select('saldo_abertura, total_entradas, total_saidas')
    .eq('id', caixaId)
    .single();
  if (fetchErr) throw fetchErr;

  const novasEntradas = (caixa.total_entradas ?? 0) + valor;
  const saldoFechamento = (caixa.saldo_abertura ?? 0) + novasEntradas - (caixa.total_saidas ?? 0);

  const { error } = await supabase
    .from('caixa')
    .update({ total_entradas: novasEntradas, saldo_fechamento: saldoFechamento })
    .eq('id', caixaId);
  if (error) throw error;
}
