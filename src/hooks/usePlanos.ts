/**
 * Re-export do módulo license para manter compatibilidade.
 * Novos códigos devem importar de '@/modules/license'.
 */
export type { PlanoInfo, BloqueioInfo } from '@/modules/license/types';
export { usePlanoAtual, useVerificarBloqueio, useTrocarPlano } from '@/modules/license/hooks/useLicense';
