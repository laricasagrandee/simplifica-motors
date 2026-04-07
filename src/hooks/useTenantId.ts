import { useAuthContext } from '@/components/layout/AuthProvider';

export function useTenantId(): string {
  const { tenantId } = useAuthContext();
  return tenantId ?? '';
}
