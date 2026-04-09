// Types
export type { PlanoInfo, BloqueioInfo, LicenseCache, LicenseStatus, NivelAviso } from './types';

// Services (lógica pura, sem dependência de React)
export { calcularBloqueio } from './services/licenseService';

// API (acesso ao banco)
export { fetchLicenseData, renewLicense } from './api/licenseApi';

// Hooks
export { usePlanoAtual, useVerificarBloqueio, useTrocarPlano } from './hooks/useLicense';
export { useAuthState, useLogin, useLogout, useUsuarioAtual, useRecuperarSenha } from './hooks/useAuth';

// Components (re-exports)
export { BloqueioScreen } from './components/BloqueioScreen';
export { BloqueioAviso } from './components/BloqueioAviso';
export { BloqueioProvider, useBloqueio } from './components/BloqueioProvider';
