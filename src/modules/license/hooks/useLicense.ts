import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { normalizarPlano } from '@/lib/planos';
import { useTenantId } from '@/hooks/useTenantId';
import { fetchLicenseData, renewLicense } from '../api/licenseApi';
import { calcularBloqueio } from '../services/licenseService';
import type { PlanoInfo, BloqueioInfo } from '../types';

export function usePlanoAtual() {
  const tenantId = useTenantId();
  return useQuery<PlanoInfo>({
    queryKey: ['plano-atual', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const data = await fetchLicenseData(tenantId!);
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
      const data = await fetchLicenseData(tenantId!);
      return calcularBloqueio({
        plano: data?.plano ?? null,
        data_vencimento_plano: data?.data_vencimento_plano ?? null,
        dias_tolerancia: data?.dias_tolerancia ?? 15,
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrocarPlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ configId }: { configId: string }) => {
      await renewLicense(configId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plano-atual'] });
      qc.invalidateQueries({ queryKey: ['verificar-bloqueio'] });
      toast({ title: 'Acesso renovado!' });
    },
  });
}
