import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agendamento {
  id: string;
  cliente_id: string | null;
  veiculo_id: string | null;
  descricao: string;
  data_hora: string;
  duracao_minutos: number;
  mecanico_id: string | null;
  status: string;
  os_id: string | null;
  observacoes: string | null;
  criado_em: string;
  clientes?: { nome: string } | null;
  motos?: { placa: string; marca: string; modelo: string } | null;
  funcionarios?: { nome: string } | null;
}

export function useListarAgendamentos(dataInicio: string, dataFim: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', dataInicio, dataFim],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos' as any)
        .select('*, clientes(nome), motos(placa, marca, modelo), funcionarios(nome)')
        .gte('data_hora', dataInicio)
        .lte('data_hora', dataFim)
        .order('data_hora', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Agendamento[];
    },
  });
}

export function useCriarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ag: {
      cliente_id: string;
      veiculo_id: string;
      descricao: string;
      data_hora: string;
      duracao_minutos: number;
      mecanico_id?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase.from('agendamentos' as any).insert(ag as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar agendamento'),
  });
}

export function useCancelarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos' as any)
        .update({ status: 'cancelado' } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento cancelado');
    },
    onError: () => toast.error('Erro ao cancelar agendamento'),
  });
}
