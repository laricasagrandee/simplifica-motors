/**
 * Tenant helpers for multi-tenant data isolation.
 * Use these in all hooks to filter and tag data by tenant.
 */

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/** Add .eq('tenant_id', tenantId) to any Supabase query builder */
export function addTenantFilter<T extends PostgrestFilterBuilder<any, any, any>>(
  query: T,
  tenantId: string,
): T {
  if (!tenantId) return query;
  return query.eq('tenant_id', tenantId) as T;
}

/** Add tenant_id to an insert payload */
export function withTenant<T extends Record<string, unknown>>(
  data: T,
  tenantId: string,
): T & { tenant_id: string } {
  return { ...data, tenant_id: tenantId };
}
