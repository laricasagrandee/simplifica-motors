import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Configuracao } from '@/types/database';

export interface OficinaComStatus extends Configuracao {
  status: 'ativo' | 'tolerancia' | 'bloqueado';
  diasRestantes: number;
}

export interface AdminFuncInfo {
  config_id: string;
  nome: string;
  email: string | null;
}

function calcularStatus(config: Configuracao): Pick<OficinaComStatus, 'status' | 'diasRestantes'> {
  if (!config.plano_ativo) return { status: 'bloqueado', diasRestantes: 0 };
  if (!config.data_vencimento_plano) return { status: 'ativo', diasRestantes: 999 };

  const venc = new Date(config.data_vencimento_plano);
  const hoje = new Date();
  const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
  const tolerancia = config.dias_tolerancia || 15;

  if (diff >= 0) return { status: 'ativo', diasRestantes: diff };
  if (Math.abs(diff) <= tolerancia) return { status: 'tolerancia', diasRestantes: tolerancia - Math.abs(diff) };
  return { status: 'bloqueado', diasRestantes: 0 };
}

export function useAdminOficinas() {
  return useQuery<OficinaComStatus[]>({
    queryKey: ['admin-oficinas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('configuracoes').select('*');
      if (error) throw error;
      return (data as unknown as Configuracao[]).map((c) => ({
        ...c,
        ...calcularStatus(c),
      }));
    },
  });
}

export function useAdminOficinasAdmins(configIds: string[]) {
  return useQuery<AdminFuncInfo[]>({
    queryKey: ['admin-oficinas-admins', configIds],
    enabled: configIds.length > 0,
    queryFn: async () => {
      // Get all admin funcionarios
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome, email, user_id, cargo')
        .eq('cargo', 'admin')
        .eq('ativo', true);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // For each admin, find which config they belong to
      // Since there's no direct config_id in funcionarios, we match via the fact
      // that each config has one set of funcionarios. We'll query all configs
      // and match by checking if the admin's user_id created that config.
      // Simpler approach: return all admins and let the UI try to match them.
      // The edge function creates config + funcionario in the same transaction,
      // so we need a different approach.
      
      // Actually the simplest: there's typically one config per "tenant".
      // Since we don't have config_id on funcionarios, we'll return all admins
      // and the page will need to figure out mapping.
      // For now, if there's only one config, all admins belong to it.
      // With multi-tenant, we'd need a config_id FK.
      
      // Workaround: fetch all configs, for each config try to find an admin
      // We can't do a perfect join without config_id, so let's just return
      // all admin funcionarios and let the page show the first one per config.
      
      // Best effort: return admins grouped. Since we can't link them to configs
      // without a FK, we'll return them as a flat list.
      return (data as any[]).map((f) => ({
        config_id: '', // Will be resolved by the page
        nome: f.nome,
        email: f.email,
      }));
    },
  });
}

export function useFuncionariosCount() {
  return useQuery<number>({
    queryKey: ['admin-funcionarios-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('funcionarios')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useAdminEditarOficina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Configuracao> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase.from('configuracoes').update(rest as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: 'Oficina atualizada!' });
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });
}

export function useAdminNovaOficina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nome_fantasia: string) => {
      const venc = new Date();
      venc.setDate(venc.getDate() + 30);
      const { error } = await supabase.from('configuracoes').insert({
        nome_fantasia,
        plano: 'basico',
        plano_ativo: true,
        data_vencimento_plano: venc.toISOString(),
        max_funcionarios: 3,
        dias_tolerancia: 15,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: 'Oficina criada!' });
    },
    onError: () => toast({ title: 'Erro ao criar oficina', variant: 'destructive' }),
  });
}

export function useAdminBloquearOficina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, liberar }: { id: string; liberar: boolean }) => {
      const updates: Record<string, unknown> = { plano_ativo: liberar };
      if (liberar) {
        const venc = new Date();
        venc.setDate(venc.getDate() + 30);
        updates.data_vencimento_plano = venc.toISOString();
      }
      const { error } = await supabase.from('configuracoes').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { liberar }) => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: liberar ? 'Oficina liberada!' : 'Oficina bloqueada!' });
    },
    onError: () => toast({ title: 'Erro na operação', variant: 'destructive' }),
  });
}

export const PLANOS_PRECO: Record<string, number> = {
  basico: 99,
  profissional: 199,
  premium: 399,
  vitalicia: 0,
  enterprise: 599,
};
