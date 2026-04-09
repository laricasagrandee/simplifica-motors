import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registerMachine, fetchMachineRegistry, fetchTenantMachines } from '../api/deviceApi';
import type { MachineRegistryPayload } from '../types';

const MACHINE_KEY = 'machine-registry';

/**
 * Hook para buscar a máquina registrada de um usuário/tenant.
 */
export function useMachineRegistryQuery(email: string | undefined, tenantId: string | undefined) {
  return useQuery({
    queryKey: [MACHINE_KEY, email, tenantId],
    queryFn: () => fetchMachineRegistry(email!, tenantId!),
    enabled: !!email && !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para listar todas as máquinas de um tenant.
 */
export function useTenantMachines(tenantId: string | undefined) {
  return useQuery({
    queryKey: [MACHINE_KEY, 'all', tenantId],
    queryFn: () => fetchTenantMachines(tenantId!),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para registrar/atualizar uma máquina.
 */
export function useRegisterMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MachineRegistryPayload) => registerMachine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MACHINE_KEY] });
    },
  });
}
