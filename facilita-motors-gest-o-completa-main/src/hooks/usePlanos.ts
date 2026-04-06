import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PlanoInfo {
  plano: string;
  plano_ativo: boolean;
  data_vencimento_plano: string | null;
  dias_tolerancia: number;
  max_funcionarios: number;
}

interface BloqueioInfo {
  bloqueado: boolean;
  emTolerancia: boolean;
  diasRestantes: number;
  mensagem: string;
}

export function usePlanoAtual() {
  return useQuery<PlanoInfo>({
    queryKey: ['plano-atual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('plano, plano_ativo, data_vencimento_plano, dias_tolerancia, max_funcionarios')
        .limit(1).single();
      if (error) throw error;
      return data as PlanoInfo;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useVerificarBloqueio() {
  return useQuery<BloqueioInfo>({
    queryKey: ['verificar-bloqueio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('plano_ativo, data_vencimento_plano, dias_tolerancia')
        .limit(1).single();
      if (error) throw error;
      if (!data?.data_vencimento_plano) return { bloqueado: false, emTolerancia: false, diasRestantes: 999, mensagem: '' };
      const venc = new Date(data.data_vencimento_plano);
      const hoje = new Date();
      const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
      const tolerancia = data.dias_tolerancia || 15;
      if (diff >= 0) return { bloqueado: false, emTolerancia: false, diasRestantes: diff, mensagem: '' };
      if (Math.abs(diff) <= tolerancia) return { bloqueado: false, emTolerancia: true, diasRestantes: tolerancia - Math.abs(diff), mensagem: `Sua assinatura venceu. Você tem ${tolerancia - Math.abs(diff)} dias para renovar.` };
      return { bloqueado: true, emTolerancia: false, diasRestantes: 0, mensagem: 'Sua assinatura expirou.' };
    },
    staleTime: 1000 * 60 * 5,
  });
}

const PLANOS = {
  basico: { max_funcionarios: 3 },
  profissional: { max_funcionarios: 10 },
  premium: { max_funcionarios: 50 },
  vitalicia: { max_funcionarios: 50 },
  enterprise: { max_funcionarios: 999 },
};

export function useTrocarPlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ plano, configId }: { plano: string; configId: string }) => {
      const cfg = PLANOS[plano as keyof typeof PLANOS] || { max_funcionarios: 3 };
      const venc = new Date(); venc.setMonth(venc.getMonth() + 1);
      const { error } = await supabase.from('configuracoes').update({
        plano, max_funcionarios: cfg.max_funcionarios, plano_ativo: true,
        data_vencimento_plano: venc.toISOString(),
      }).eq('id', configId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plano-atual'] }); qc.invalidateQueries({ queryKey: ['verificar-bloqueio'] }); toast({ title: 'Plano atualizado!' }); },
  });
}
