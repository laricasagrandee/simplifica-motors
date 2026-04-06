import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Periodo { dataInicio: string; dataFim: string; }

export function useFaturamentoPeriodo(p: Periodo) {
  return useQuery({
    queryKey: ['rel-faturamento', p],
    queryFn: async () => {
      const { data: os } = await supabase.from('ordens_servico').select('valor_total, criado_em')
        .in('status', ['concluida', 'entregue']).gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const { data: pdv } = await supabase.from('vendas_pdv').select('valor_total, criado_em')
        .gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const total = [...(os || []), ...(pdv || [])].reduce((s, r) => s + Number(r.valor_total), 0);
      const porDia = new Map<string, number>();
      [...(os || []), ...(pdv || [])].forEach(r => {
        const d = r.criado_em?.slice(0, 10) || '';
        porDia.set(d, (porDia.get(d) || 0) + Number(r.valor_total));
      });
      return { total, porDia: Array.from(porDia.entries()).map(([data, valor]) => ({ data, valor })).sort((a, b) => a.data.localeCompare(b.data)) };
    },
  });
}

export function useTicketMedio(p: Periodo) {
  return useQuery({
    queryKey: ['rel-ticket', p],
    queryFn: async () => {
      const { data } = await supabase.from('ordens_servico').select('valor_total')
        .in('status', ['concluida', 'entregue']).gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      if (!data?.length) return { valor: 0, count: 0 };
      const sum = data.reduce((s, o) => s + Number(o.valor_total), 0);
      return { valor: sum / data.length, count: data.length };
    },
  });
}

export function useOSPorStatus(p: Periodo) {
  return useQuery({
    queryKey: ['rel-os-status', p],
    queryFn: async () => {
      const { data } = await supabase.from('ordens_servico').select('status')
        .gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const counts = new Map<string, number>();
      (data || []).forEach(o => counts.set(o.status, (counts.get(o.status) || 0) + 1));
      return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
    },
  });
}

export function useProdutividadeMecanicos(p: Periodo) {
  return useQuery({
    queryKey: ['rel-produtividade', p],
    queryFn: async () => {
      const { data: os } = await supabase.from('ordens_servico')
        .select('mecanico_id, valor_total, valor_mao_obra, criado_em, data_conclusao, funcionarios(id, nome, comissao_percentual)')
        .in('status', ['concluida', 'entregue']).gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { nome: string; osFeitas: number; faturamento: number; tempoTotal: number; maoObra: number; comissaoPct: number }>();
      (os || []).forEach(o => {
        const func = (o as unknown as Record<string, unknown>).funcionarios as Record<string, unknown> | null;
        if (!func?.id) return;
        const id = func.id as string;
        const e = map.get(id) || { nome: func.nome as string, osFeitas: 0, faturamento: 0, tempoTotal: 0, maoObra: 0, comissaoPct: Number(func.comissao_percentual || 0) };
        e.osFeitas++;
        e.faturamento += Number(o.valor_total);
        e.maoObra += Number(o.valor_mao_obra || 0);
        if (o.data_conclusao && o.criado_em) {
          e.tempoTotal += (new Date(o.data_conclusao).getTime() - new Date(o.criado_em).getTime()) / 86400000;
        }
        map.set(id, e);
      });
      return Array.from(map.entries()).map(([id, m]) => ({
        id, ...m, tempoMedio: m.osFeitas > 0 ? m.tempoTotal / m.osFeitas : 0,
        comissao: m.maoObra * m.comissaoPct / 100,
      })).sort((a, b) => b.faturamento - a.faturamento);
    },
  });
}

export function usePecasMaisVendidas(p: Periodo, limit = 10) {
  return useQuery({
    queryKey: ['rel-pecas-rank', p, limit],
    queryFn: async () => {
      const { data } = await supabase.from('os_itens').select('peca_id, descricao, quantidade, valor_total, pecas(nome)')
        .eq('tipo', 'peca').gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { nome: string; qtd: number; receita: number }>();
      (data || []).forEach(i => {
        const peca = (i as unknown as Record<string, unknown>).pecas as Record<string, unknown> | null;
        const nome = (peca?.nome as string) || i.descricao || 'Peça';
        const key = i.peca_id || nome;
        const e = map.get(key) || { nome, qtd: 0, receita: 0 };
        e.qtd += Number(i.quantidade); e.receita += Number(i.valor_total);
        map.set(key, e);
      });
      return Array.from(map.values()).sort((a, b) => b.qtd - a.qtd).slice(0, limit);
    },
  });
}

export function useClientesRanking(p: Periodo, limit = 10) {
  return useQuery({
    queryKey: ['rel-clientes-rank', p, limit],
    queryFn: async () => {
      const { data } = await supabase.from('ordens_servico').select('cliente_id, valor_total, clientes(id, nome)')
        .in('status', ['concluida', 'entregue']).gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { id: string; nome: string; osCount: number; total: number }>();
      (data || []).forEach(o => {
        const cli = (o as unknown as Record<string, unknown>).clientes as Record<string, unknown> | null;
        if (!cli?.id) return;
        const id = cli.id as string;
        const e = map.get(id) || { id, nome: cli.nome as string, osCount: 0, total: 0 };
        e.osCount++; e.total += Number(o.valor_total);
        map.set(id, e);
      });
      return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, limit);
    },
  });
}

export function useVeiculosMaisAtendidos(p: Periodo) {
  return useQuery({
    queryKey: ['rel-veiculos', p],
    queryFn: async () => {
      const { data } = await supabase.from('ordens_servico').select('moto_id, motos(marca, modelo)')
        .gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { marca: string; modelo: string; tipo: string; count: number }>();
      (data || []).forEach(o => {
        const v = (o as unknown as Record<string, unknown>).motos as Record<string, unknown> | null;
        if (!v) return;
        const key = `${v.marca}-${v.modelo}`;
        const e = map.get(key) || { marca: v.marca as string, modelo: v.modelo as string, tipo: 'moto', count: 0 };
        e.count++;
        map.set(key, e);
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
    },
  });
}

export function useServicosMaisRealizados(p: Periodo) {
  return useQuery({
    queryKey: ['rel-servicos', p],
    queryFn: async () => {
      const { data } = await supabase.from('os_itens').select('descricao, quantidade, valor_total')
        .eq('tipo', 'servico').gte('criado_em', p.dataInicio).lte('criado_em', p.dataFim + 'T23:59:59');
      const map = new Map<string, { descricao: string; count: number; receita: number }>();
      (data || []).forEach(i => {
        const key = (i.descricao || '').toLowerCase().trim();
        const e = map.get(key) || { descricao: i.descricao || '', count: 0, receita: 0 };
        e.count += Number(i.quantidade); e.receita += Number(i.valor_total);
        map.set(key, e);
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
    },
  });
}

export function useComparativoMensal() {
  return useQuery({
    queryKey: ['rel-comparativo'],
    queryFn: async () => {
      const now = new Date();
      const periodos = [
        { label: 'Mês Atual', m: now.getMonth(), y: now.getFullYear() },
        { label: 'Mês Anterior', m: now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1, y: now.getMonth() - 1 < 0 ? now.getFullYear() - 1 : now.getFullYear() },
        { label: 'Mesmo Mês Ano Ant.', m: now.getMonth(), y: now.getFullYear() - 1 },
      ];
      const result: { label: string; faturamento: number }[] = [];
      for (const p of periodos) {
        const inicio = `${p.y}-${String(p.m + 1).padStart(2, '0')}-01`;
        const fim = new Date(p.y, p.m + 1, 0);
        const fimStr = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`;
        const { data } = await supabase.from('ordens_servico').select('valor_total')
          .in('status', ['concluida', 'entregue']).gte('criado_em', inicio).lte('criado_em', fimStr + 'T23:59:59');
        result.push({ label: p.label, faturamento: (data || []).reduce((s, o) => s + Number(o.valor_total), 0) });
      }
      return result;
    },
  });
}
