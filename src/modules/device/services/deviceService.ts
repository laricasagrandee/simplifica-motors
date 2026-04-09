import type { DeviceType, DeviceMode, DeviceInfo } from '../types';

const LOCAL_SERVER_PORT = 3847;
const DEVICE_MODE_KEY = 'fm:device-mode';

/**
 * Detecta se o dispositivo é desktop ou mobile.
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
 * No Tauri, usa a API exposta via window.__TAURI__.
 * No navegador puro, retorna null.
 */
export function getMachineName(): string | null {
  if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
    // O hostname é injetado pelo setup do Tauri (vide main.rs / setup)
    return (window as any).__FM_HOSTNAME__ ?? null;
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
 * Verifica se estamos rodando dentro do Tauri (app desktop).
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
}

/** @deprecated Use isTauri() */
export const isElectron = isTauri;
