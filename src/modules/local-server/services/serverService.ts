import type { LocalServerInfo } from '../types';
import { getLocalServerPort, getMachineName, isTauri } from '@/modules/device';

const APP_VERSION = '1.0.0';

/**
 * Monta a configuração do servidor local.
 */
export function getServerConfig() {
  return {
    port: getLocalServerPort(),
    hostname: getMachineName() || 'unknown',
  };
}

/**
 * Cria a resposta padrão do /api/ping.
 * Usado pelo servidor HTTP embutido no Tauri.
 */
export function buildPingResponse(tenantId: string) {
  return {
    ok: true as const,
    serverTime: new Date().toISOString(),
    machineName: getMachineName() || 'unknown',
    version: APP_VERSION,
    tenantId,
  };
}

/**
 * Verifica se o servidor local pode ser iniciado.
 * O servidor é gerenciado pelo processo Tauri (Rust side),
 * mas o frontend pode solicitar start/stop via Tauri commands.
 */
export function canStartServer(): boolean {
  return isTauri();
}

/**
 * Solicita ao processo Tauri que inicie o servidor HTTP local.
 * No Tauri, isso é feito via invoke (Tauri command definido no Rust).
 * Se não estiver no Tauri, retorna erro.
 */
export async function requestStartServer(): Promise<LocalServerInfo> {
  if (!canStartServer()) {
    return {
      status: 'error',
      port: getLocalServerPort(),
      hostname: null,
      startedAt: null,
      error: 'Tauri runtime not available',
    };
  }

  try {
    // Tauri command: start_local_server (definido no Rust)
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<{ ok: boolean; error?: string }>('start_local_server');
    return {
      status: result?.ok ? 'running' : 'error',
      port: getLocalServerPort(),
      hostname: getMachineName(),
      startedAt: result?.ok ? new Date().toISOString() : null,
      error: result?.error,
    };
  } catch (err) {
    return {
      status: 'error',
      port: getLocalServerPort(),
      hostname: null,
      startedAt: null,
      error: (err as Error).message,
    };
  }
}

/**
 * Solicita ao processo Tauri que pare o servidor local.
 */
export async function requestStopServer(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('stop_local_server');
  } catch {
    // Silently ignore if command not available
  }
}
