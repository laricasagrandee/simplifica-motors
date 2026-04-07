import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useResetSenha() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast({ title: 'Link de reset enviado!' }),
    onError: (e: Error) => toast({ title: 'Erro ao resetar senha', description: e.message, variant: 'destructive' }),
  });
}

interface LicenseUpdate {
  config_id: string;
  plano?: string;
  plano_ativo?: boolean;
  data_vencimento_plano?: string | null;
  max_funcionarios?: number;
}

export function useAtualizarLicenca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: LicenseUpdate) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-manage-license', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracoes'] });
      qc.invalidateQueries({ queryKey: ['plano-atual'] });
      qc.invalidateQueries({ queryKey: ['verificar-bloqueio'] });
      toast({ title: 'Licença atualizada!' });
    },
    onError: (e: Error) => toast({ title: 'Erro ao atualizar licença', description: e.message, variant: 'destructive' }),
  });
}
