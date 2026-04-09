import { supabase } from '@/integrations/supabase/client';

/** Busca dados de licença/plano da configuração do tenant */
export async function fetchLicenseData(tenantId: string) {
  let query = supabase
    .from('configuracoes')
    .select('plano, plano_ativo, data_vencimento_plano, dias_tolerancia, max_funcionarios');
  if (tenantId) query = query.eq('id', tenantId);
  const { data, error } = await query.limit(1).single();
  if (error) throw error;
  return data;
}

/**
 * Calcula a próxima data de vencimento baseada na data anterior.
 * Se a data anterior já passou, avança ciclos até ficar no futuro.
 * Nunca usa "hoje" como base — preserva o ciclo fixo do plano.
 */
export function calcularProximoVencimento(
  dataVencimentoAnterior: string | null,
  periodoDias: number = 30,
): string {
  const agora = new Date();

  if (!dataVencimentoAnterior) {
    // Primeira ativação: usa hoje como base
    const d = new Date(agora);
    d.setDate(d.getDate() + periodoDias);
    return d.toISOString();
  }

  const vencAnterior = new Date(dataVencimentoAnterior);
  let proximo = new Date(vencAnterior);
  proximo.setDate(proximo.getDate() + periodoDias);

  // Avança ciclos até a data ficar no futuro
  while (proximo <= agora) {
    proximo.setDate(proximo.getDate() + periodoDias);
  }

  return proximo.toISOString();
}

/** Renova o plano (trocar/ativar) — requer data de vencimento anterior */
export async function renewLicense(configId: string, dataVencimentoAnterior: string | null, periodoDias: number = 30) {
  const novoVencimento = calcularProximoVencimento(dataVencimentoAnterior, periodoDias);
  const { error } = await supabase.from('configuracoes').update({
    max_funcionarios: 999,
    plano_ativo: true,
    dias_tolerancia: 15,
    data_vencimento_plano: novoVencimento,
  }).eq('id', configId);
  if (error) throw error;
}
