import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TempoServico {
  id: string;
  os_id: string;
  mecanico_id: string | null;
  inicio: string;
  fim: string | null;
  duracao_minutos: number | null;
  pausado: boolean | null;
  criado_em: string | null;
}

export function useTempoAtivo(osId: string) {
  return useQuery<TempoServico | null>({
    queryKey: ['tempo-servico', osId, 'ativo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_tempo_servico')
        .select('*')
        .eq('os_id', osId)
        .is('fim', null)
        .maybeSingle();
      if (error) throw error;
      return data as TempoServico | null;
    },
    enabled: !!osId,
    refetchInterval: 10_000,
  });
}

export function useTempoPorOS(osId: string) {
  return useQuery<{ registros: TempoServico[]; totalMinutos: number }>({
    queryKey: ['tempo-servico', osId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_tempo_servico')
        .select('*')
        .eq('os_id', osId)
        .order('inicio', { ascending: false });
      if (error) throw error;
      const registros = (data ?? []) as TempoServico[];
      const totalMinutos = registros.reduce((s, r) => s + (r.duracao_minutos ?? 0), 0);
      return { registros, totalMinutos };
    },
    enabled: !!osId,
  });
}

export function useIniciarTempo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ osId, mecanicoId }: { osId: string; mecanicoId: string }) => {
      const { error } = await supabase.from('os_tempo_servico').insert({
        os_id: osId,
        mecanico_id: mecanicoId,
        inicio: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['tempo-servico', v.osId] });
    },
  });
}

export function usePararTempo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, osId, inicio }: { id: string; osId: string; inicio: string }) => {
      const fim = new Date().toISOString();
      const duracao = Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000);
      const { error } = await supabase
        .from('os_tempo_servico')
        .update({ fim, duracao_minutos: duracao })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['tempo-servico', v.osId] });
    },
  });
}
