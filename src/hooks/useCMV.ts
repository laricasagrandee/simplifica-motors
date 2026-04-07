import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { tf } from '@/lib/tenantHelper';

interface Periodo { dataInicio: string; dataFim: string; }

export function useCMVResumo(periodo: Periodo) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['cmv-resumo', periodo, tenantId],
    queryFn: async () => {
      const { data: os } = await tf(supabase.from('ordens_servico').select('valor_total, valor_pecas').in('status', ['concluida', 'entregue']).gte('criado_em', periodo.dataInicio).lte('criado_em', periodo.dataFim + 'T23:59:59'), tenantId);
      const { data: pdv } = await tf(supabase.from('vendas_pdv').select('valor_total, desconto').gte('criado_em', periodo.dataInicio).lte('criado_em', periodo.dataFim + 'T23:59:59'), tenantId);
      const fatOS = (os || []).reduce((s: number, o: any) => s + Number(o.valor_total), 0);
      const fatPDV = (pdv || []).reduce((s: number, v: any) => s + Number(v.valor_total), 0);
      const faturamento = fatOS + fatPDV;
      const custoOS = (os || []).reduce((s: number, o: any) => s + Number(o.valor_pecas || 0), 0);
      const { data: pdvItens } = await tf(supabase.from('vendas_pdv_itens').select('quantidade, peca_id, pecas(preco_custo)').gte('criado_em', periodo.dataInicio).lte('criado_em', periodo.dataFim + 'T23:59:59'), tenantId);
      const custoPDV = (pdvItens || []).reduce((s: number, i: any) => { const custo = i.pecas ? Number(i.pecas.preco_custo || 0) : 0; return s + custo * Number(i.quantidade); }, 0);
      const cmv = custoOS + custoPDV;
      const lucro = faturamento - cmv;
      const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
      return { faturamento, cmv, lucro, margem };
    },
  });
}

export function useCMVPorOS(periodo: Periodo) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['cmv-por-os', periodo, tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('ordens_servico').select('id, numero, valor_total, valor_pecas, clientes(nome)').in('status', ['concluida', 'entregue']).gte('criado_em', periodo.dataInicio).lte('criado_em', periodo.dataFim + 'T23:59:59').order('valor_total', { ascending: false }), tenantId);
      if (error) throw error;
      return (data || []).map((o: any) => {
        const lucro = Number(o.valor_total) - Number(o.valor_pecas || 0);
        const margem = Number(o.valor_total) > 0 ? (lucro / Number(o.valor_total)) * 100 : 0;
        const cliente = o.clientes?.nome as string || '';
        return { id: o.id, numero: o.numero, cliente, faturamento: Number(o.valor_total), custo: Number(o.valor_pecas || 0), lucro, margem };
      });
    },
  });
}

export function useCMVPorPeca(periodo: Periodo) {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['cmv-por-peca', periodo, tenantId],
    queryFn: async () => {
      const { data, error } = await tf(supabase.from('os_itens').select('quantidade, valor_unitario, valor_total, peca_id, descricao, pecas(nome, preco_custo)').eq('tipo', 'peca').gte('criado_em', periodo.dataInicio).lte('criado_em', periodo.dataFim + 'T23:59:59'), tenantId);
      if (error) throw error;
      const map = new Map<string, { nome: string; qtd: number; receita: number; custo: number }>();
      (data || []).forEach((i: any) => {
        const peca = i.pecas as Record<string, unknown> | null;
        const nome = (peca?.nome as string) || i.descricao || 'Peça';
        const key = i.peca_id || nome;
        const entry = map.get(key) || { nome, qtd: 0, receita: 0, custo: 0 };
        entry.qtd += Number(i.quantidade); entry.receita += Number(i.valor_total); entry.custo += Number(peca?.preco_custo || 0) * Number(i.quantidade);
        map.set(key, entry);
      });
      return Array.from(map.values()).map(p => ({ ...p, lucro: p.receita - p.custo, margem: p.receita > 0 ? ((p.receita - p.custo) / p.receita) * 100 : 0 })).sort((a, b) => b.lucro - a.lucro);
    },
  });
}

export function useCMVEvolucao() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['cmv-evolucao', tenantId],
    queryFn: async () => {
      const meses: { mes: string; faturamento: number; cmv: number; lucro: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const inicio = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const fimStr = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`;
        const { data: os } = await tf(supabase.from('ordens_servico').select('valor_total, valor_pecas').in('status', ['concluida', 'entregue']).gte('criado_em', inicio).lte('criado_em', fimStr + 'T23:59:59'), tenantId);
        const fat = (os || []).reduce((s: number, o: any) => s + Number(o.valor_total), 0);
        const cmv = (os || []).reduce((s: number, o: any) => s + Number(o.valor_pecas || 0), 0);
        meses.push({ mes: d.toLocaleDateString('pt-BR', { month: 'short' }), faturamento: fat, cmv, lucro: fat - cmv });
      }
      return meses;
    },
  });
}
