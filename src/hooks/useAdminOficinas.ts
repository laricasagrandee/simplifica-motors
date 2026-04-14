import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calcularProximoVencimento } from '@/modules/license/api/licenseApi';
import { toast } from '@/hooks/use-toast';
import type { Configuracao } from '@/types/database';

export interface OficinaComStatus extends Configuracao {
  status: 'ativo' | 'aviso' | 'bloqueado';
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

  if (diff >= 0) return { status: 'ativo', diasRestantes: diff };
  const diasAtraso = Math.abs(diff);
  if (diasAtraso <= 15) return { status: 'aviso', diasRestantes: 15 - diasAtraso };
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
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome, email, user_id, cargo')
        .eq('cargo', 'admin')
        .eq('ativo', true);
      if (error) throw error;
      if (!data || data.length === 0) return [];
      return (data as any[]).map((f) => ({
        config_id: '',
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
      const { data, error } = await supabase.functions.invoke('admin-update-license', {
        body: { config_id: id, updates: rest },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: 'Oficina atualizada!' });
    },
    onError: (e: any) => toast({ title: e?.message || 'Erro ao atualizar', variant: 'destructive' }),
  });
}

export function useAdminExcluirOficina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('admin-delete-tenant', {
        body: { config_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: 'Oficina excluída!' });
    },
    onError: () => toast({ title: 'Erro ao excluir', variant: 'destructive' }),
  });
}

export function useAdminBloquearOficina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, liberar, dataVencimentoAnterior }: { id: string; liberar: boolean; dataVencimentoAnterior?: string | null }) => {
      const updates: Record<string, unknown> = { plano_ativo: liberar };
      if (liberar) {
        updates.data_vencimento_plano = calcularProximoVencimento(dataVencimentoAnterior ?? null, 30);
      }
      const { data, error } = await supabase.functions.invoke('admin-update-license', {
        body: { config_id: id, updates },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: (_, { liberar }) => {
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      toast({ title: liberar ? 'Oficina liberada!' : 'Oficina bloqueada!' });
    },
    onError: (e: any) => toast({ title: e?.message || 'Erro na operação', variant: 'destructive' }),
  });
}
