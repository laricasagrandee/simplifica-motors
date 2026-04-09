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

/** Renova o plano (trocar/ativar) */
export async function renewLicense(configId: string) {
  const venc = new Date();
  venc.setMonth(venc.getMonth() + 1);
  const { error } = await supabase.from('configuracoes').update({
    max_funcionarios: 999,
    plano_ativo: true,
    dias_tolerancia: 15,
    data_vencimento_plano: venc.toISOString(),
  }).eq('id', configId);
  if (error) throw error;
}
