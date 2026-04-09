import type { ServerStatus, LocalServerInfo, ServerConfig } from '../types';
import { getLocalServerPort, getMachineName } from '@/modules/device';

const APP_VERSION = '1.0.0';

/**
 * Monta a configuração do servidor local.
 */
export function getServerConfig(): ServerConfig {
  return {
    port: getLocalServerPort(),
    hostname: getMachineName() || 'unknown',
  };
}

/**
 * Cria a resposta padrão do /api/ping.
 * Usado pelo servidor Express no Electron.
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
 * Só funciona dentro do Electron.
 */
export function canStartServer(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI?.startServer;
}

/**
 * Solicita ao processo principal do Electron que inicie o servidor Express.
 * Retorna o status resultante.
 */
export async function requestStartServer(): Promise<LocalServerInfo> {
  if (!canStartServer()) {
    return {
      status: 'error',
      port: getLocalServerPort(),
      hostname: null,
      startedAt: null,
      error: 'Electron API not available',
    };
  }

  try {
    const result = await (window as any).electronAPI.startServer();
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
 * Solicita ao processo principal que pare o servidor.
 */
export async function requestStopServer(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.stopServer) {
    await (window as any).electronAPI.stopServer();
  }
}
