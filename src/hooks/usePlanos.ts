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
  nivel: 'suave' | 'forte' | 'urgente' | null;
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
      if (!data?.data_vencimento_plano) return { bloqueado: false, emTolerancia: false, nivel: null, diasRestantes: 999, mensagem: '' };

      const venc = new Date(data.data_vencimento_plano);
      const hoje = new Date();
      const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);

      // Ainda não venceu
      if (diff >= 0) return { bloqueado: false, emTolerancia: false, nivel: null, diasRestantes: diff, mensagem: '' };

      const diasAtraso = Math.abs(diff);

      // 1-5 dias: aviso suave
      if (diasAtraso <= 5) {
        return {
          bloqueado: false, emTolerancia: true, nivel: 'suave' as const,
          diasRestantes: 15 - diasAtraso,
          mensagem: 'Sua assinatura venceu. Renove para continuar usando sem interrupções.',
        };
      }

      // 6-10 dias: aviso forte
      if (diasAtraso <= 10) {
        return {
          bloqueado: false, emTolerancia: true, nivel: 'forte' as const,
          diasRestantes: 15 - diasAtraso,
          mensagem: 'Seu acesso será bloqueado em breve. Entre em contato para renovar.',
        };
      }

      // 11-15 dias: aviso urgente
      if (diasAtraso <= 15) {
        const diasParaBloqueio = 15 - diasAtraso;
        return {
          bloqueado: false, emTolerancia: true, nivel: 'urgente' as const,
          diasRestantes: diasParaBloqueio,
          mensagem: `Último aviso! Seu acesso será bloqueado em ${diasParaBloqueio} dia${diasParaBloqueio > 1 ? 's' : ''}.`,
        };
      }

      // 15+ dias: bloqueado
      return { bloqueado: true, emTolerancia: false, nivel: null, diasRestantes: 0, mensagem: 'Seu acesso foi suspenso por pendência financeira.' };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrocarPlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ configId }: { configId: string }) => {
      const venc = new Date(); venc.setMonth(venc.getMonth() + 1);
      const { error } = await supabase.from('configuracoes').update({
        plano: 'padrao', max_funcionarios: 999, plano_ativo: true,
        data_vencimento_plano: venc.toISOString(),
      }).eq('id', configId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plano-atual'] }); qc.invalidateQueries({ queryKey: ['verificar-bloqueio'] }); toast({ title: 'Plano atualizado!' }); },
  });
}
