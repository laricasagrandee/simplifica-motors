export type StatusOS =
  | 'aberta'
  | 'em_orcamento'
  | 'aprovada'
  | 'em_execucao'
  | 'concluida'
  | 'entregue'
  | 'cancelada';

export type CategoriaPeca =
  | 'motor'
  | 'suspensao'
  | 'freios'
  | 'eletrica'
  | 'acessorios'
  | 'lubrificantes'
  | 'pneus'
  | 'filtros'
  | 'transmissao'
  | 'outros';

export type CargoFuncionario = 'admin' | 'gerente' | 'mecanico' | 'atendente';

export type FormaPagamento =
  | 'dinheiro'
  | 'pix'
  | 'cartao_debito'
  | 'cartao_credito'
  | 'boleto'
  | 'multiplo';

export interface Cliente {
  id: string;
  tenant_id?: string | null;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string | null;
  endereco_cep: string | null;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  data_nascimento: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export interface Veiculo {
  id: string;
  tenant_id?: string | null;
  cliente_id: string;
  marca: string;
  modelo: string;
  ano: number | null;
  cor: string | null;
  placa: string;
  quilometragem: number | null;
  observacoes: string | null;
  criado_em: string | null;
}

/** @deprecated Use Veiculo instead */
export type Moto = Veiculo;

export type TipoVeiculo = 'moto' | 'carro';

export interface Peca {
  id: string;
  tenant_id?: string | null;
  nome: string;
  codigo: string | null;
  codigo_barras: string | null;
  marca: string | null;
  categoria: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number | null;
  estoque_minimo: number | null;
  unidade: string | null;
  qr_code_url: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export interface OrdemServico {
  id: string;
  tenant_id?: string | null;
  numero: number;
  cliente_id: string;
  moto_id: string;
  mecanico_id: string | null;
  status: string;
  problema_relatado: string;
  diagnostico: string | null;
  observacoes: string | null;
  valor_pecas: number | null;
  valor_mao_obra: number | null;
  custo_pecas: number | null;
  lucro_bruto: number | null;
  desconto: number | null;
  valor_total: number | null;
  forma_pagamento: string | null;
  parcelas: number | null;
  data_abertura: string | null;
  data_aprovacao: string | null;
  data_conclusao: string | null;
  data_entrega: string | null;
  previsao_entrega: string | null;
  checklist: ChecklistItem[] | null;
  assinatura_cliente: string | null;
  garantia_dias?: number | null;
  garantia_ate?: string | null;
  motivo_recusa?: string | null;
  valor_orcamento_recusado?: number | null;
  criado_em: string | null;
  atualizado_em: string | null;
  // joined
  clientes?: { nome: string; telefone?: string } | null;
  motos?: { marca: string; modelo: string; placa: string } | null;
  funcionarios?: { nome: string } | null;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  concluidoEm?: string;
  concluidoPor?: string;
}

export interface OSItem {
  id: string;
  tenant_id?: string | null;
  os_id: string;
  tipo: 'peca' | 'servico';
  peca_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  custo_unitario: number | null;
  custo_total: number | null;
  criado_em: string | null;
}

export interface OSFoto {
  id: string;
  tenant_id?: string | null;
  os_id: string;
  tipo: string;
  categoria: string | null;
  descricao: string | null;
  url: string;
  criado_em: string | null;
}

export interface Movimentacao {
  id: string;
  tenant_id?: string | null;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento: string | null;
  os_id: string | null;
  venda_pdv_id: string | null;
  pago: boolean | null;
  data_vencimento: string | null;
  data: string | null;
  criado_por: string | null;
}

export interface Funcionario {
  id: string;
  tenant_id?: string | null;
  user_id: string | null;
  nome: string;
  cargo: string;
  telefone: string;
  email: string | null;
  salario: number | null;
  comissao_percentual: number | null;
  ativo: boolean | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export interface NotaFiscal {
  id: string;
  tenant_id?: string | null;
  numero: number;
  tipo: string;
  os_id: string | null;
  venda_pdv_id: string | null;
  valor: number;
  serie: string | null;
  emitida_em: string | null;
  emitente_cnpj: string | null;
  emitente_razao: string | null;
  destinatario_nome: string | null;
  destinatario_cpf_cnpj: string | null;
  pdf_url: string | null;
}

export interface TaxasParcelamento {
  [parcelas: string]: number;
}

export interface Configuracao {
  id: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  ie: string | null;
  telefone: string | null;
  email: string | null;
  endereco_completo: string | null;
  logo_url: string | null;
  plano: string | null;
  max_funcionarios: number | null;
  plano_ativo: boolean | null;
  data_vencimento_plano: string | null;
  dias_tolerancia: number | null;
  aliquota_imposto: number | null;
  taxa_cartao_debito: number | null;
  taxa_cartao_credito: number | null;
  taxa_cartao_credito_parcelado: number | null;
  taxas_parcelamento: TaxasParcelamento | null;
  atualizado_em: string | null;
  formato_impressao?: string | null;
}

export interface VendaPDV {
  id: string;
  tenant_id?: string | null;
  numero: number;
  cliente_id: string | null;
  valor_total: number;
  custo_total: number;
  lucro_bruto: number;
  desconto: number | null;
  forma_pagamento: string;
  parcelas: number | null;
  valor_recebido: number | null;
  troco: number | null;
  observacoes: string | null;
  criado_em: string | null;
  criado_por: string | null;
}

export interface VendaPDVItem {
  id: string;
  venda_id: string;
  peca_id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  custo_unitario: number | null;
  custo_total: number | null;
  criado_em: string | null;
}

export interface EstoqueMovimentacao {
  id: string;
  tenant_id?: string | null;
  peca_id: string;
  tipo: string;
  quantidade: number;
  preco_unitario: number | null;
  motivo: string;
  observacao: string | null;
  referencia_id: string | null;
  criado_em: string | null;
  criado_por: string | null;
}

export interface Caixa {
  id: string;
  tenant_id?: string | null;
  data: string;
  saldo_abertura: number | null;
  saldo_fechamento: number | null;
  total_entradas: number | null;
  total_saidas: number | null;
  status: string | null;
  observacoes: string | null;
  aberto_em: string | null;
  aberto_por: string | null;
  fechado_em: string | null;
  fechado_por: string | null;
}

export interface OSPagamento {
  id: string;
  tenant_id?: string | null;
  os_id: string;
  forma_pagamento: FormaPagamento;
  valor: number;
  parcelas: number;
  valor_recebido: number | null;
  troco: number | null;
  observacao: string | null;
  criado_em: string | null;
}

export interface DREData {
  receita_bruta: number;
  cmv: number;
  lucro_bruto: number;
  despesas_operacionais: number;
  lucro_operacional: number;
  impostos: number;
  lucro_liquido: number;
}
