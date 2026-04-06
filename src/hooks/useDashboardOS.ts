import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME = 30_000;

export interface OSRecente {
  id: string;
  numero: number;
  status: string;
  valor_total: number;
  criado_em: string;
  cliente_nome: string;
  moto_modelo: string;
  moto_placa: string | null;
}

export function useUltimasOS() {
  return useQuery<OSRecente[]>({
    queryKey: ['dashboard-ultimas-os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('id, numero, status, valor_total, criado_em, clientes(nome), motos(modelo, placa)')
        .order('criado_em', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []).map((os: Record<string, unknown>) => {
        const cliente = os.clientes as Record<string, unknown> | null;
        const moto = os.motos as Record<string, unknown> | null;
        return {
          id: os.id as string,
          numero: os.numero as number,
          status: os.status as string,
          valor_total: Number(os.valor_total),
          criado_em: os.criado_em as string,
          cliente_nome: (cliente?.nome as string) ?? 'Sem cliente',
          moto_modelo: [moto?.marca, moto?.modelo].filter(Boolean).join(' ') || '',
          moto_placa: (moto?.placa as string) ?? null,
        };
      });
    },
    staleTime: STALE_TIME,
  });
}
