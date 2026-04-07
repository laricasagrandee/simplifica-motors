/**
 * Tenant helpers for multi-tenant data isolation.
 * Uses `as any` casts because tenant_id is not in the auto-generated
 * Supabase types yet. After running the migration and regenerating
 * types, these casts can be removed.
 */

/** Add .eq('tenant_id', tenantId) to any Supabase query builder */
export function tf(query: any, tenantId: string): any {
  if (!tenantId) return query;
  return query.eq('tenant_id', tenantId);
}

/** Add tenant_id to an insert payload, returns as any to bypass strict types */
export function wt(data: Record<string, unknown>, tenantId: string): any {
  if (!tenantId) return data;
  return { ...data, tenant_id: tenantId };
}
