import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeEmail, sanitizeNumeric, sanitizeMonetary } from '@/lib/sanitize';
import { toast } from '@/hooks/use-toast';
import type { Funcionario, CargoFuncionario } from '@/types/database';

export function useFuncionarios(cargo?: CargoFuncionario) {
  return useQuery<Funcionario[]>({
    queryKey: ['funcionarios', cargo],
    queryFn: async () => {
      let query = supabase.from('funcionarios').select('*').order('nome');
      if (cargo) query = query.eq('cargo', cargo).eq('ativo', true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Funcionario[];
    },
    staleTime: 60_000,
  });
}

export function useFuncionarioPorId(id: string) {
  return useQuery<Funcionario>({
    queryKey: ['funcionario', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('funcionarios').select('*').eq('id', id).single();
      if (error) throw error;
      return data as unknown as Funcionario;
    },
    enabled: !!id,
  });
}

interface FuncData { nome: string; cargo: CargoFuncionario; telefone: string; email?: string; salario: number; comissao_percentual?: number; }

export function useCriarFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: FuncData) => {
      const { error } = await supabase.from('funcionarios').insert({
        nome: sanitizeInput(d.nome, 200),
        cargo: d.cargo,
        telefone: sanitizeNumeric(d.telefone),
        email: d.email ? sanitizeEmail(d.email) : null,
        salario: sanitizeMonetary(d.salario),
        comissao_percentual: d.comissao_percentual || 0,
        ativo: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); toast({ title: 'Funcionário cadastrado!' }); },
    onError: () => toast({ title: 'Erro ao cadastrar', variant: 'destructive' }),
  });
}

export function useEditarFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: FuncData & { id: string }) => {
      const { error } = await supabase.from('funcionarios').update({
        nome: sanitizeInput(d.nome, 200),
        cargo: d.cargo,
        telefone: sanitizeNumeric(d.telefone),
        email: d.email ? sanitizeEmail(d.email) : null,
        salario: sanitizeMonetary(d.salario),
        comissao_percentual: d.comissao_percentual || 0,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); toast({ title: 'Funcionário atualizado!' }); },
  });
}

export function useToggleAtivoFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('funcionarios').update({ ativo }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); toast({ title: 'Status atualizado!' }); },
  });
}
