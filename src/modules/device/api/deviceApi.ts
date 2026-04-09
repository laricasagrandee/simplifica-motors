import { supabase } from '@/integrations/supabase/client';
import type { MachineRegistry, MachineRegistryPayload } from '../types';

/**
 * Registra ou atualiza a máquina no Supabase.
 * Usa upsert no par (email, tenant_id) para evitar duplicatas.
 */
export async function registerMachine(payload: MachineRegistryPayload): Promise<MachineRegistry> {
  const { data, error } = await (supabase as any)
    .from('machine_registry')
    .upsert(
      {
        email: payload.email,
        tenant_id: payload.tenant_id,
        machine_name: payload.machine_name,
        porta: payload.porta,
        ip: payload.ip ?? null,
        modo: payload.modo,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'email,tenant_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as MachineRegistry;
}

/**
 * Busca a máquina registrada para um tenant/email.
 * Usado pelo celular para descobrir como conectar no PC.
 */
export async function fetchMachineRegistry(
  email: string,
  tenantId: string
): Promise<MachineRegistry | null> {
  const { data, error } = await (supabase as any)
    .from('machine_registry')
    .select('*')
    .eq('email', email)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) throw error;
  return (data as MachineRegistry) ?? null;
}

/**
 * Busca todas as máquinas registradas para um tenant.
 * Útil quando há múltiplos PCs.
 */
export async function fetchTenantMachines(tenantId: string): Promise<MachineRegistry[]> {
  const { data, error } = await (supabase as any)
    .from('machine_registry')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('atualizado_em', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MachineRegistry[];
}
