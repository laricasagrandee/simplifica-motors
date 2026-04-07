import type { CargoFuncionario } from '@/types/database';

export type Acao =
  | 'ver_dashboard'
  | 'gerenciar_clientes'
  | 'gerenciar_pecas'
  | 'gerenciar_os'
  | 'usar_pdv'
  | 'ver_financeiro'
  | 'ver_cmv'
  | 'ver_dre'
  | 'ver_relatorios'
  | 'gerenciar_equipe'
  | 'emitir_nf'
  | 'ver_configuracoes'
  | 'gerenciar_planos'
  | 'excluir_dados';

const PERMISSOES: Record<CargoFuncionario, Set<Acao>> = {
  admin: new Set<Acao>([
    'ver_dashboard', 'gerenciar_clientes', 'gerenciar_pecas', 'gerenciar_os',
    'usar_pdv', 'ver_financeiro', 'ver_cmv', 'ver_dre', 'ver_relatorios',
    'gerenciar_equipe', 'emitir_nf', 'ver_configuracoes', 'gerenciar_planos',
    'excluir_dados',
  ]),
  gerente: new Set<Acao>([
    'ver_dashboard', 'gerenciar_clientes', 'gerenciar_pecas', 'gerenciar_os',
    'usar_pdv', 'ver_financeiro', 'ver_cmv', 'ver_dre', 'ver_relatorios',
    'gerenciar_equipe', 'emitir_nf', 'ver_configuracoes',
  ]),
  mecanico: new Set<Acao>([
    'ver_dashboard', 'gerenciar_os', 'gerenciar_pecas', 'ver_relatorios',
  ]),
  atendente: new Set<Acao>([
    'ver_dashboard', 'gerenciar_clientes', 'gerenciar_pecas', 'gerenciar_os',
    'usar_pdv',
  ]),
};

export function temPermissao(cargo: CargoFuncionario | undefined, acao: Acao): boolean {
  if (!cargo) return false;
  return PERMISSOES[cargo]?.has(acao) ?? false;
}

export { PERMISSOES };
