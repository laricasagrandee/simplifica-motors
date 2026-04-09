import type { DeviceType, DeviceMode, DeviceInfo } from '../types';

const LOCAL_SERVER_PORT = 3847;
const DEVICE_MODE_KEY = 'fm:device-mode';

/**
 * Detecta se o dispositivo é desktop ou mobile.
 * Usa user-agent + tela como heurística.
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;

  return isMobile || isSmallScreen ? 'mobile' : 'desktop';
}

/**
 * Retorna o modo de uso salvo localmente.
 * Padrão: 'desktop-only' para PC, 'mobile-only' para celular.
 */
export function getDeviceMode(): DeviceMode {
  const saved = localStorage.getItem(DEVICE_MODE_KEY) as DeviceMode | null;
  if (saved && ['desktop-only', 'mobile-only', 'desktop-mobile'].includes(saved)) {
    return saved;
  }
  return detectDeviceType() === 'desktop' ? 'desktop-only' : 'mobile-only';
}

/**
 * Salva o modo de uso escolhido pelo usuário.
 */
export function setDeviceMode(mode: DeviceMode): void {
  localStorage.setItem(DEVICE_MODE_KEY, mode);
}

/**
 * Captura o hostname da máquina.
 * No Electron, usa a API exposta via preload (window.electronAPI.getHostname).
 * No navegador, retorna null.
 */
export function getMachineName(): string | null {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.getHostname) {
    return (window as any).electronAPI.getHostname();
  }
  return null;
}

/**
 * Retorna a porta fixa usada pelo servidor local.
 */
export function getLocalServerPort(): number {
  return LOCAL_SERVER_PORT;
}

/**
 * Monta as informações completas do dispositivo.
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    type: detectDeviceType(),
    mode: getDeviceMode(),
    machineName: getMachineName(),
  };
}

/**
 * Verifica se estamos rodando dentro do Electron.
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
}
