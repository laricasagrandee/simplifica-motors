export const CATEGORIAS_FINANCEIRO = [
  'os_pagamento',
  'os_parcela',
  'venda_pdv',
  'venda_avulsa',
  'compra_pecas',
  'despesa_aluguel',
  'despesa_energia',
  'despesa_agua',
  'despesa_internet',
  'despesa_oficina',
  'salario',
  'comissao',
  'imposto',
  'outros',
] as const;

export const CATEGORIAS_LABELS: Record<string, string> = {
  os_pagamento: 'Pagamento OS',
  os_parcela: 'Parcela OS',
  venda_pdv: 'Venda PDV',
  venda_avulsa: 'Venda Avulsa',
  compra_pecas: 'Compra Peças',
  despesa_aluguel: 'Aluguel',
  despesa_energia: 'Energia',
  despesa_agua: 'Água',
  despesa_internet: 'Internet',
  despesa_oficina: 'Despesa Oficina',
  salario: 'Salário',
  comissao: 'Comissão',
  imposto: 'Imposto',
  outros: 'Outros',
};

export const CATEGORIAS_ENTRADA = ['os_pagamento', 'os_parcela', 'venda_pdv', 'venda_avulsa', 'outros'] as const;
export const CATEGORIAS_SAIDA = [
  'compra_pecas', 'despesa_aluguel', 'despesa_energia', 'despesa_agua', 'despesa_internet',
  'despesa_oficina', 'salario', 'comissao', 'imposto', 'outros',
] as const;
