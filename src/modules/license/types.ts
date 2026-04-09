export type { Funcionario, CargoFuncionario } from '@/types/database';

/** Estado da licença armazenado localmente para tolerância offline */
export interface LicenseCache {
  tenantId: string;
  plano: string;
  dataVencimento: string;
  verificadoEm: string;
  bloqueado: boolean;
}

/** Status da licença */
export type LicenseStatus = 'ativa' | 'aviso' | 'tolerancia' | 'bloqueada';
