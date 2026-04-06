import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Configuracao } from '@/types/database';
import type { NFItem } from '@/components/nf/NFPreviewItens';

export interface NotaFiscalCompleta {
  id: string;
  numero: number;
  tipo: string;
  serie: string | null;
  valor: number;
  emitida_em: string | null;
  os_id: string | null;
  destinatario_nome: string | null;
  destinatario_cpf_cnpj: string | null;
  destinatario_telefone?: string | null;
  destinatario_email?: string | null;
  itens: NFItem[];
  veiculo: { marca: string; modelo: string; placa: string; ano?: number | null } | null;
  os_numero: number | null;
  desconto: number;
  aliquota: number;
  valor_imposto: number;
  config: Configuracao;
}

export function useNFCompleta(nfId: string) {
  return useQuery<NotaFiscalCompleta>({
    queryKey: ['nf-completa', nfId],
    queryFn: async () => {
      // 1. NF base
      const { data: nf, error: nfErr } = await supabase
        .from('notas_fiscais').select('*').eq('id', nfId).single();
      if (nfErr) throw nfErr;

      // 2. Config
      const { data: configs } = await supabase.from('configuracoes').select('*').limit(1);
      const config = (configs?.[0] ?? {}) as Configuracao;
      const aliquota = config.aliquota_imposto ?? 0;

      // 3. OS data + itens + client
      let itens: NFItem[] = [];
      let veiculo = null;
      let osNumero = null;
      let desconto = 0;
      let destinatarioTelefone: string | null = null;
      let destinatarioEmail: string | null = null;

      if (nf.os_id) {
        const [osRes, itensRes] = await Promise.all([
          supabase.from('ordens_servico')
            .select('numero, desconto, clientes(telefone, email), motos(marca, modelo, placa, ano)')
            .eq('id', nf.os_id).single(),
          supabase.from('os_itens').select('id, descricao, tipo, quantidade, valor_unitario, valor_total')
            .eq('os_id', nf.os_id).order('tipo'),
        ]);
        osNumero = osRes.data?.numero ?? null;
        desconto = osRes.data?.desconto ?? 0;
        const veic = osRes.data?.motos as { marca: string; modelo: string; placa: string; ano?: number | null } | null;
        veiculo = veic;
        itens = (itensRes.data || []) as NFItem[];
        const cli = osRes.data?.clientes as { telefone?: string; email?: string } | null;
        destinatarioTelefone = cli?.telefone ?? null;
        destinatarioEmail = cli?.email ?? null;
      }

      const baseCalculo = itens.reduce((s, i) => s + i.valor_total, 0) - desconto;
      const valorImposto = baseCalculo * (aliquota / 100);

      return {
        id: nf.id,
        numero: nf.numero,
        tipo: nf.tipo,
        serie: nf.serie,
        valor: nf.valor,
        emitida_em: nf.emitida_em,
        os_id: nf.os_id,
        destinatario_nome: nf.destinatario_nome,
        destinatario_cpf_cnpj: nf.destinatario_cpf_cnpj,
        destinatario_telefone: destinatarioTelefone,
        destinatario_email: destinatarioEmail,
        itens,
        veiculo,
        os_numero: osNumero,
        desconto,
        aliquota,
        valor_imposto: valorImposto,
        config,
      };
    },
    enabled: !!nfId,
  });
}
