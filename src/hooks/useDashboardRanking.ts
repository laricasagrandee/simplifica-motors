import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

const STALE_TIME = 30_000;

export interface MecanicoRank {
  nome: string; total_os: number; faturamento: number;
  meta_os?: number; meta_faturamento?: number; pct_os?: number; pct_faturamento?: number;
}

export function useRankingMecanicos() {
  const tenantId = useTenantId();
  return useQuery<MecanicoRank[]>({
    queryKey: ['dashboard-ranking-mecanicos', tenantId],
    queryFn: async () => {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();
      const firstDay = new Date(ano, mes - 1, 1).toISOString();

      const [{ data: osData, error: e1 }, { data: metasData }] = await Promise.all([
        tf(supabase.from('ordens_servico').select('mecanico_id, valor_total, funcionarios(nome)').in('status', ['concluida', 'entregue']).gte('criado_em', firstDay).not('mecanico_id', 'is', null), tenantId),
        tf(supabase.from('metas_mecanico' as any).select('funcionario_id, meta_os, meta_faturamento').eq('mes', mes).eq('ano', ano), tenantId),
      ]);
      if (e1) throw e1;

      const metasMap = new Map<string, { meta_os: number; meta_faturamento: number }>();
      ((metasData ?? []) as unknown as { funcionario_id: string; meta_os: number; meta_faturamento: number }[]).forEach(m => {
        metasMap.set(m.funcionario_id, { meta_os: m.meta_os, meta_faturamento: m.meta_faturamento });
      });

      const map = new Map<string, MecanicoRank>();
      (osData ?? []).forEach((os: Record<string, unknown>) => {
        const fid = os.mecanico_id as string;
        const func = os.funcionarios as Record<string, unknown> | null;
        const nome = (func?.nome as string) ?? 'Sem nome';
        const existing = map.get(fid) ?? { nome, total_os: 0, faturamento: 0 };
        existing.total_os += 1;
        existing.faturamento += Number(os.valor_total);
        map.set(fid, existing);
      });

      return Array.from(map.entries()).map(([fid, rank]) => {
        const meta = metasMap.get(fid);
        return { ...rank, meta_os: meta?.meta_os, meta_faturamento: meta?.meta_faturamento, pct_os: meta?.meta_os ? Math.round((rank.total_os / meta.meta_os) * 100) : undefined, pct_faturamento: meta?.meta_faturamento ? Math.round((rank.faturamento / meta.meta_faturamento) * 100) : undefined };
      }).sort((a, b) => b.total_os - a.total_os).slice(0, 5);
    },
    staleTime: STALE_TIME,
  });
}
