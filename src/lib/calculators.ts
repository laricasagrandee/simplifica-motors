import type { DREData } from '@/types/database';

export function calcularCMV(custos: number[]): number {
  return custos.reduce((acc, c) => acc + c, 0);
}

export function calcularMargemLucro(precoVenda: number, precoCusto: number): number {
  if (precoVenda === 0) return 0;
  return ((precoVenda - precoCusto) / precoVenda) * 100;
}

export function calcularComissao(valorMaoObra: number, percentual: number): number {
  return (valorMaoObra * percentual) / 100;
}

export function calcularTicketMedio(faturamentoTotal: number, quantidadeOS: number): number {
  if (quantidadeOS === 0) return 0;
  return faturamentoTotal / quantidadeOS;
}

export function calcularDRE(
  receitaBruta: number,
  cmv: number,
  despesasOperacionais: number,
  aliquotaImpostos: number = 6,
): DREData {
  const lucro_bruto = receitaBruta - cmv;
  const lucro_operacional = lucro_bruto - despesasOperacionais;
  const impostos = (receitaBruta * aliquotaImpostos) / 100;
  const lucro_liquido = lucro_operacional - impostos;
  return {
    receita_bruta: receitaBruta,
    cmv,
    lucro_bruto,
    despesas_operacionais: despesasOperacionais,
    lucro_operacional,
    impostos,
    lucro_liquido,
  };
}
