import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type AcaoLog = 'criar' | 'editar' | 'excluir' | 'status';

interface LogParams {
  acao: AcaoLog;
  tabela: string;
  registroId?: string;
  dadosAntes?: object;
  dadosDepois?: object;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  acao: string;
  tabela: string;
  registro_id: string | null;
  dados_antes: object | null;
  dados_depois: object | null;
  criado_em: string;
}

export function useRegistrarLog() {
  return useMutation({
    mutationFn: async (params: LogParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('audit_log' as any).insert({
        user_id: user?.id ?? null,
        acao: params.acao,
        tabela: params.tabela,
        registro_id: params.registroId ?? null,
        dados_antes: params.dadosAntes ?? null,
        dados_depois: params.dadosDepois ?? null,
      } as any);
      if (error) throw error;
    },
  });
}

// Standalone function for use inside onSuccess callbacks
export async function registrarLog(params: LogParams) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('audit_log' as any).insert({
    user_id: user?.id ?? null,
    acao: params.acao,
    tabela: params.tabela,
    registro_id: params.registroId ?? null,
    dados_antes: params.dadosAntes ?? null,
    dados_depois: params.dadosDepois ?? null,
  } as any);
}

export function useListarLogs(tabela?: string, limit = 50, pagina = 1) {
  return useQuery<{ data: AuditLogEntry[]; total: number }>({
    queryKey: ['audit-logs', tabela, limit, pagina],
    queryFn: async () => {
      const from = (pagina - 1) * limit;
      const to = from + limit - 1;
      let query = supabase
        .from('audit_log' as any)
        .select('*', { count: 'exact' })
        .order('criado_em', { ascending: false })
        .range(from, to);
      if (tabela) query = query.eq('tabela', tabela);
      const { data, count, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as unknown as AuditLogEntry[], total: count ?? 0 };
    },
  });
}
