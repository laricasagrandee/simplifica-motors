import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

interface DREResult {
  receitaBruta: number; cmv: number; lucroBruto: number;
  despesas: { categoria: string; valor: number }[];
  totalDespesas: number; lucroOperacional: number; impostos: number; lucroLiquido: number;
}

async function calcularDRE(inicio: string, fim: string, tenantId: string): Promise<DREResult> {
  const { data: entradas } = await tf(supabase.from('movimentacoes').select('valor').eq('tipo', 'entrada').eq('pago', true).gte('data', inicio).lte('data', fim), tenantId);
  const receitaBruta = (entradas || []).reduce((s: number, e: any) => s + Number(e.valor), 0);

  const { data: os } = await tf(supabase.from('ordens_servico').select('valor_pecas').in('status', ['concluida', 'entregue']).gte('criado_em', inicio).lte('criado_em', fim + 'T23:59:59'), tenantId);
  const cmv = (os || []).reduce((s: number, o: any) => s + Number(o.valor_pecas || 0), 0);
  const lucroBruto = receitaBruta - cmv;

  const { data: saidas } = await tf(supabase.from('movimentacoes').select('categoria, valor').eq('tipo', 'saida').eq('pago', true).gte('data', inicio).lte('data', fim), tenantId);
  const despMap = new Map<string, number>();
  (saidas || []).forEach((s: any) => { despMap.set(s.categoria, (despMap.get(s.categoria) || 0) + Number(s.valor)); });
  const despesas = Array.from(despMap.entries()).map(([categoria, valor]) => ({ categoria, valor })).sort((a, b) => b.valor - a.valor);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const lucroOperacional = lucroBruto - totalDespesas;
  const impostos = Math.max(lucroOperacional * 0.06, 0);
  const lucroLiquido = lucroOperacional - impostos;
  return { receitaBruta, cmv, lucroBruto, despesas, totalDespesas, lucroOperacional, impostos, lucroLiquido };
}

export function useDREMensal(mes: number, ano: number) {
  const tenantId = useTenantId();
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = new Date(ano, mes, 0);
  const fimStr = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`;
  return useQuery({ queryKey: ['dre-mensal', mes, ano, tenantId], queryFn: () => calcularDRE(inicio, fimStr, tenantId) });
}

export function useDREComparativo(mes: number, ano: number) {
  const mesAnt = mes === 1 ? 12 : mes - 1;
  const anoAnt = mes === 1 ? ano - 1 : ano;
  const atual = useDREMensal(mes, ano);
  const anterior = useDREMensal(mesAnt, anoAnt);
  return { atual, anterior };
}

export function useDREEvolucao() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['dre-evolucao', tenantId],
    queryFn: async () => {
      const now = new Date();
      const result: { mes: string; lucroLiquido: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth() + 1; const a = d.getFullYear();
        const inicio = `${a}-${String(m).padStart(2, '0')}-01`;
        const fim = new Date(a, m, 0);
        const fimStr = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`;
        const dre = await calcularDRE(inicio, fimStr, tenantId);
        result.push({ mes: d.toLocaleDateString('pt-BR', { month: 'short' }), lucroLiquido: dre.lucroLiquido });
      }
      return result;
    },
  });
}
