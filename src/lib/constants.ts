import type { StatusOS, CategoriaPeca, CargoFuncionario, FormaPagamento } from '@/types/database';

export const STATUS_OS_CONFIG: Record<StatusOS, { label: string; icon: string; className: string }> = {
  aberta: { label: 'Aberta', icon: 'CircleDot', className: 'bg-info-light text-info border-info-border' },
  em_orcamento: { label: 'Orçamento Enviado', icon: 'FileEdit', className: 'bg-warning-light text-warning border-warning-border' },
  aprovada: { label: 'Aprovada', icon: 'CheckCircle', className: 'bg-accent-light text-accent border-accent-border' },
  em_execucao: { label: 'Em Serviço', icon: 'Wrench', className: 'bg-purple-light text-purple border-purple-border' },
  concluida: { label: 'Pronto', icon: 'CheckCheck', className: 'bg-success-light text-success border-success-border' },
  entregue: { label: 'Retirado', icon: 'PackageCheck', className: 'bg-muted text-muted-foreground border-border' },
  cancelada: { label: 'Cancelada', icon: 'XCircle', className: 'bg-danger-light text-danger border-danger-border' },
};

export const CATEGORIAS_PECAS: Record<CategoriaPeca, string> = {
  motor: 'Motor',
  suspensao: 'Suspensão',
  freios: 'Freios',
  eletrica: 'Elétrica',
  acessorios: 'Acessórios',
  lubrificantes: 'Lubrificantes',
  pneus: 'Pneus',
  filtros: 'Filtros',
  transmissao: 'Transmissão',
  outros: 'Outros',
};

export const CARGOS: Record<CargoFuncionario, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  mecanico: 'Mecânico',
  atendente: 'Atendente',
};

export const FORMAS_PAGAMENTO: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão Débito',
  cartao_credito: 'Cartão Crédito',
  boleto: 'Boleto',
  multiplo: 'Múltiplo',
};

export const MARCAS_MOTO = [
  'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW',
  'Dafra', 'Shineray', 'Haojue', 'Triumph', 'Harley-Davidson', 'Royal Enfield', 'Outras',
] as const;

export const MARCAS_CARRO = [
  'Chevrolet', 'Fiat', 'Volkswagen', 'Ford', 'Toyota', 'Hyundai', 'Honda',
  'Jeep', 'Renault', 'Nissan', 'Peugeot', 'Citroën', 'BMW', 'Mercedes-Benz',
  'Audi', 'Kia', 'Mitsubishi', 'Outras',
] as const;

/** @deprecated Use MARCAS_MOTO */
export const MARCAS_MOTOS = MARCAS_MOTO;

export const TIPOS_VEICULO = [
  { value: 'moto' as const, label: 'Moto', icon: 'Bike' },
  { value: 'carro' as const, label: 'Carro', icon: 'Car' },
] as const;

export const CATEGORIAS_DESPESA = [
  'Aluguel', 'Energia', 'Água', 'Internet', 'Salários',
  'Compra de Peças', 'Manutenção', 'Marketing', 'Impostos', 'Outros',
] as const;
