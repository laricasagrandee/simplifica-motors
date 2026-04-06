import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PeriodoRelatorio { dataInicio: string; dataFim: string; }

interface RecusaResumo {
  totalRecusado: number;
  porMotivo: { motivo: string; count: number; valor: number }[];
  total: number;
}

export function useRecusasPeriodo(periodo: PeriodoRelatorio) {
  return useQuery<RecusaResumo>({
    queryKey: ['relatorio-recusas', periodo.dataInicio, periodo.dataFim],
    queryFn: async () => {
      const { data } = await supabase
        .from('ordens_servico')
        .select('motivo_recusa, valor_orcamento_recusado')
        .eq('status', 'cancelada')
        .not('motivo_recusa', 'is', null)
        .gte('criado_em', periodo.dataInicio)
        .lte('criado_em', periodo.dataFim);

      const items = data ?? [];
      const map = new Map<string, { count: number; valor: number }>();

      items.forEach((os) => {
        const m = os.motivo_recusa || 'Não informado';
        const prev = map.get(m) || { count: 0, valor: 0 };
        map.set(m, { count: prev.count + 1, valor: prev.valor + (os.valor_orcamento_recusado ?? 0) });
      });

      const porMotivo = Array.from(map.entries())
        .map(([motivo, v]) => ({ motivo, ...v }))
        .sort((a, b) => b.valor - a.valor);

      return {
        totalRecusado: items.reduce((s, os) => s + (os.valor_orcamento_recusado ?? 0), 0),
        porMotivo,
        total: items.length,
      };
    },
  });
}
