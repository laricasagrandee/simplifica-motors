export type { Funcionario, CargoFuncionario } from '@/types/database';

/** Informações do plano */
export interface PlanoInfo {
  plano: string;
  plano_ativo: boolean;
  data_vencimento_plano: string | null;
  dias_tolerancia: number;
  max_funcionarios: number;
}

/** Resultado da verificação de bloqueio */
export interface BloqueioInfo {
  bloqueado: boolean;
  emTolerancia: boolean;
  emPreAviso: boolean;
  nivel: 'info' | 'suave' | 'forte' | 'urgente' | null;
  diasRestantes: number;
  mensagem: string;
}

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

/** Níveis de aviso */
export type NivelAviso = 'info' | 'suave' | 'forte' | 'urgente';
