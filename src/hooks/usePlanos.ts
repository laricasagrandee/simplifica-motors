import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { normalizarPlano } from '@/lib/planos';
import { useTenantId } from '@/hooks/useTenantId';

interface PlanoInfo {
  plano: string;
  plano_ativo: boolean;
  data_vencimento_plano: string | null;
  dias_tolerancia: number;
  max_funcionarios: number;
}

export interface BloqueioInfo {
  bloqueado: boolean;
  emTolerancia: boolean;
  emPreAviso: boolean;
  nivel: 'info' | 'suave' | 'forte' | 'urgente' | null;
  diasRestantes: number;
  mensagem: string;
}

export function usePlanoAtual() {
  const tenantId = useTenantId();
  return useQuery<PlanoInfo>({
    queryKey: ['plano-atual', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      let query = supabase
        .from('configuracoes')
        .select('plano, plano_ativo, data_vencimento_plano, dias_tolerancia, max_funcionarios');
      if (tenantId) query = query.eq('id', tenantId);
      const { data, error } = await query.limit(1).single();
      if (error) throw error;

      return {
        plano: normalizarPlano(data?.plano),
        plano_ativo: data?.plano_ativo ?? true,
        data_vencimento_plano: data?.data_vencimento_plano ?? null,
        dias_tolerancia: data?.dias_tolerancia ?? 15,
        max_funcionarios: data?.max_funcionarios ?? 999,
      } as PlanoInfo;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useVerificarBloqueio() {
  const tenantId = useTenantId();
  return useQuery<BloqueioInfo>({
    queryKey: ['verificar-bloqueio', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      let query = supabase
        .from('configuracoes')
        .select('plano, plano_ativo, data_vencimento_plano, dias_tolerancia');
      if (tenantId) query = query.eq('id', tenantId);
      const { data, error } = await query.limit(1).single();
      if (error) throw error;

      const semAviso: BloqueioInfo = { bloqueado: false, emTolerancia: false, emPreAviso: false, nivel: null, diasRestantes: 999, mensagem: '' };

      if (!data?.data_vencimento_plano) return semAviso;

      const plano = normalizarPlano(data.plano);
      const eTeste = plano === 'teste';

      const venc = new Date(data.data_vencimento_plano);
      const hoje = new Date();
      const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);

      // --- PRÉ-VENCIMENTO ---
      if (diff > 0) {
        // Teste: aviso todos os dias
        if (eTeste) {
          return {
            bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'info' as const,
            diasRestantes: diff,
            mensagem: `Seu teste grátis acaba em ${diff} dia${diff > 1 ? 's' : ''}. Entre em contato para ativar seu plano.`,
          };
        }
        // Pago: aviso nos últimos 7 dias
        if (diff <= 7) {
          return {
            bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'info' as const,
            diasRestantes: diff,
            mensagem: `Seu acesso vence em ${diff} dia${diff > 1 ? 's' : ''}. Considere renovar.`,
          };
        }
        return semAviso;
      }

      // --- VENCE HOJE (diff === 0) ---
      if (diff === 0) {
        return {
          bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'suave' as const,
          diasRestantes: 0,
          mensagem: eTeste
            ? 'Seu teste grátis acaba hoje! Entre em contato para ativar seu plano.'
            : 'Seu acesso vence hoje. Renove para não perder o acesso.',
        };
      }

      // --- PÓS-VENCIMENTO (tolerância) ---
      const diasAtraso = Math.abs(diff);

      if (diasAtraso <= 5) {
        return {
          bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'suave' as const,
          diasRestantes: 15 - diasAtraso,
          mensagem: 'Sua assinatura venceu. Renove para continuar usando sem interrupções.',
        };
      }

      if (diasAtraso <= 10) {
        return {
          bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'forte' as const,
          diasRestantes: 15 - diasAtraso,
          mensagem: 'Seu acesso será bloqueado em breve. Entre em contato para renovar.',
        };
      }

      if (diasAtraso <= 15) {
        const diasParaBloqueio = 15 - diasAtraso;
        return {
          bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'urgente' as const,
          diasRestantes: diasParaBloqueio,
          mensagem: `Último aviso! Seu acesso será bloqueado em ${diasParaBloqueio} dia${diasParaBloqueio > 1 ? 's' : ''}.`,
        };
      }

      return { bloqueado: true, emTolerancia: false, emPreAviso: false, nivel: null, diasRestantes: 0, mensagem: 'Seu acesso foi suspenso por pendência financeira.' };
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
        max_funcionarios: 999, plano_ativo: true, dias_tolerancia: 15,
        data_vencimento_plano: venc.toISOString(),
      }).eq('id', configId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plano-atual'] }); qc.invalidateQueries({ queryKey: ['verificar-bloqueio'] }); toast({ title: 'Acesso renovado!' }); },
  });
}
