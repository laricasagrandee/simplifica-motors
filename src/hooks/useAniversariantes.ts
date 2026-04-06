import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Aniversariante {
  id: string;
  nome: string;
  telefone: string;
  data_nascimento: string;
  diasPara: number;
}

export function useAniversariantesDaSemana() {
  return useQuery<Aniversariante[]>({
    queryKey: ['aniversariantes-semana'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, data_nascimento')
        .not('data_nascimento', 'is', null);
      if (error) throw error;

      const hoje = new Date();
      const resultado: Aniversariante[] = [];

      (data ?? []).forEach((c) => {
        if (!c.data_nascimento) return;
        const [, mes, dia] = c.data_nascimento.split('-').map(Number);
        for (let d = 0; d <= 7; d++) {
          const check = new Date(hoje);
          check.setDate(hoje.getDate() + d);
          if (check.getMonth() + 1 === mes && check.getDate() === dia) {
            resultado.push({
              id: c.id,
              nome: c.nome,
              telefone: c.telefone,
              data_nascimento: c.data_nascimento,
              diasPara: d,
            });
            break;
          }
        }
      });

      return resultado.sort((a, b) => a.diasPara - b.diasPara);
    },
    staleTime: 60_000,
  });
}
