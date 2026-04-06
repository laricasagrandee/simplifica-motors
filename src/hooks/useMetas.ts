import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MetaMecanico {
  id: string;
  funcionario_id: string;
  mes: number;
  ano: number;
  meta_os: number;
  meta_faturamento: number;
  funcionarios?: { nome: string } | null;
}

export interface ProgressoMeta {
  meta_os: number;
  meta_faturamento: number;
  os_realizadas: number;
  faturamento_realizado: number;
}

export function useMetasMes(mes: number, ano: number) {
  return useQuery<MetaMecanico[]>({
    queryKey: ['metas', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_mecanico' as any)
        .select('*, funcionarios(nome)')
        .eq('mes', mes)
        .eq('ano', ano);
      if (error) throw error;
      return (data ?? []) as unknown as MetaMecanico[];
    },
  });
}

export function useDefinirMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (meta: { funcionario_id: string; mes: number; ano: number; meta_os: number; meta_faturamento: number }) => {
      const { error } = await supabase
        .from('metas_mecanico' as any)
        .upsert(meta as any, { onConflict: 'funcionario_id,mes,ano' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metas'] });
      toast.success('Meta salva');
    },
    onError: () => toast.error('Erro ao salvar meta'),
  });
}

export function useProgressoMetas(mes: number, ano: number) {
  return useQuery<Map<string, ProgressoMeta>>({
    queryKey: ['metas-progresso', mes, ano],
    queryFn: async () => {
      const firstDay = new Date(ano, mes - 1, 1).toISOString();
      const lastDay = new Date(ano, mes, 0, 23, 59, 59).toISOString();

      const [{ data: metas }, { data: osData }] = await Promise.all([
        supabase.from('metas_mecanico' as any).select('*').eq('mes', mes).eq('ano', ano),
        supabase.from('ordens_servico')
          .select('mecanico_id, valor_total')
          .in('status', ['concluida', 'entregue'])
          .gte('data_conclusao', firstDay)
          .lte('data_conclusao', lastDay)
          .not('mecanico_id', 'is', null),
      ]);

      const map = new Map<string, ProgressoMeta>();
      ((metas ?? []) as unknown as MetaMecanico[]).forEach((m) => {
        map.set(m.funcionario_id, { meta_os: m.meta_os, meta_faturamento: m.meta_faturamento, os_realizadas: 0, faturamento_realizado: 0 });
      });

      (osData ?? []).forEach((os) => {
        const entry = map.get(os.mecanico_id as string);
        if (entry) {
          entry.os_realizadas += 1;
          entry.faturamento_realizado += Number(os.valor_total ?? 0);
        }
      });

      return map;
    },
  });
}
