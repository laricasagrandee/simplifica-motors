import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeNumeric, sanitizeMonetary } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { tf, wt } from '@/lib/tenantHelper';
import { sanitizeEmail } from '@/lib/sanitize';
import { toast } from '@/hooks/use-toast';
import type { Configuracao } from '@/types/database';

export function useConfiguracoes() {
  const tenantId = useTenantId();
  return useQuery<Configuracao>({
    queryKey: ['configuracoes', tenantId],
    queryFn: async () => {
      if (tenantId) {
        const { data, error } = await supabase.from('configuracoes').select('*').eq('id', tenantId).single();
        if (error) throw error;
        return data as unknown as Configuracao;
      }
      const { data, error } = await supabase.from('configuracoes').select('*').limit(1).single();
      if (error) throw error;
      return data as unknown as Configuracao;
    },
  });
}

export function useAtualizarConfiguracoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<Configuracao> & { id: string }) => {
      const updates: Record<string, unknown> = {};
      if (d.razao_social !== undefined) updates.razao_social = sanitizeInput(d.razao_social || '', 200);
      if (d.nome_fantasia !== undefined) updates.nome_fantasia = sanitizeInput(d.nome_fantasia || '', 200);
      if (d.cnpj !== undefined) updates.cnpj = sanitizeNumeric(d.cnpj || '');
      if (d.ie !== undefined) updates.ie = sanitizeInput(d.ie || '', 50);
      if (d.telefone !== undefined) updates.telefone = sanitizeNumeric(d.telefone || '');
      if (d.email !== undefined) updates.email = sanitizeEmail(d.email || '');
      if (d.endereco_completo !== undefined) updates.endereco_completo = sanitizeInput(d.endereco_completo || '', 500);
      if (d.logo_url !== undefined) updates.logo_url = d.logo_url;
      if ((d as Record<string, unknown>).aliquota_imposto !== undefined) updates.aliquota_imposto = (d as Record<string, unknown>).aliquota_imposto;
      if ((d as Record<string, unknown>).taxa_cartao_debito !== undefined) updates.taxa_cartao_debito = (d as Record<string, unknown>).taxa_cartao_debito;
      if ((d as Record<string, unknown>).taxa_cartao_credito !== undefined) updates.taxa_cartao_credito = (d as Record<string, unknown>).taxa_cartao_credito;
      if ((d as Record<string, unknown>).taxa_cartao_credito_parcelado !== undefined) updates.taxa_cartao_credito_parcelado = (d as Record<string, unknown>).taxa_cartao_credito_parcelado;
      if ((d as Record<string, unknown>).taxas_parcelamento !== undefined) updates.taxas_parcelamento = (d as Record<string, unknown>).taxas_parcelamento;
      if ((d as Record<string, unknown>).garantia_dias_padrao !== undefined) updates.garantia_dias_padrao = (d as Record<string, unknown>).garantia_dias_padrao;
      if ((d as Record<string, unknown>).formato_impressao !== undefined) updates.formato_impressao = (d as Record<string, unknown>).formato_impressao;
      const { error } = await supabase.from('configuracoes').update(updates as any).eq('id', d.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['configuracoes'] }); toast({ title: 'Configurações salvas!' }); },
    onError: () => toast({ title: 'Erro ao salvar', variant: 'destructive' }),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, configId }: { file: File; configId: string }) => {
      const ext = file.name.split('.').pop();
      const path = `logos/${configId}.${ext}`;
      const { error: upErr } = await supabase.storage.from('configuracoes').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('configuracoes').getPublicUrl(path);
      await supabase.from('configuracoes').update({ logo_url: data.publicUrl }).eq('id', configId);
      return data.publicUrl;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['configuracoes'] }); toast({ title: 'Logo atualizado!' }); },
  });
}
