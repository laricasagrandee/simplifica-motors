/**
 * Re-export de auth hooks.
 * A lógica permanece em src/hooks/useAuth.ts por enquanto,
 * pois o AuthProvider e vários componentes já importam de lá.
 * Este arquivo serve como ponto de entrada do módulo license.
 */
export {
  useAuthState,
  useLogin,
  useLogout,
  useUsuarioAtual,
  useRecuperarSenha,
} from '@/hooks/useAuth';
