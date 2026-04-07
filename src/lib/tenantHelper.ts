/**
 * Tenant helpers for multi-tenant data isolation.
 * Note: tenant_id is not in the auto-generated Supabase types yet,
 * so we use `as any` casts. After running the migration and regenerating
 * types, these casts can be removed.
 */

/** Add .eq('tenant_id', tenantId) to any Supabase query builder */
export function addTenantFilter(query: any, tenantId: string): any {
  if (!tenantId) return query;
  return query.eq('tenant_id', tenantId);
}

/** Add tenant_id to an insert payload */
export function withTenant<T extends Record<string, unknown>>(
  data: T,
  tenantId: string,
): T & { tenant_id: string } {
  return { ...data, tenant_id: tenantId };
}
