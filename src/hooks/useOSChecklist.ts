import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ChecklistItem } from '@/types/database';

export function useAtualizarChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ osId, checklist }: { osId: string; checklist: ChecklistItem[] }) => {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ checklist: checklist as unknown as import('@/integrations/supabase/types').Json })
        .eq('id', osId);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['os', v.osId] }),
  });
}

export const CHECKLIST_EXECUCAO: Omit<ChecklistItem, 'id'>[] = [
  { texto: 'Verificar nível de óleo', concluido: false },
  { texto: 'Verificar freios', concluido: false },
  { texto: 'Verificar pneus', concluido: false },
  { texto: 'Verificar correia/corrente', concluido: false },
  { texto: 'Verificar parte elétrica', concluido: false },
  { texto: 'Teste de rodagem', concluido: false },
  { texto: 'Limpeza geral', concluido: false },
];

/** @deprecated Use CHECKLIST_EXECUCAO */
export const CHECKLIST_PADRAO = CHECKLIST_EXECUCAO;

export const CHECKLIST_ENTREGA: Omit<ChecklistItem, 'id'>[] = [
  { texto: 'Testou freios dianteiro e traseiro', concluido: false },
  { texto: 'Testou iluminação (farol, seta, lanterna)', concluido: false },
  { texto: 'Testou partida do motor', concluido: false },
  { texto: 'Verificou nível de óleo', concluido: false },
  { texto: 'Verificou nível de fluido de freio', concluido: false },
  { texto: 'Teste de rodagem realizado', concluido: false },
  { texto: 'Limpeza geral do veículo', concluido: false },
  { texto: 'Peças substituídas conferidas com cliente', concluido: false },
];
