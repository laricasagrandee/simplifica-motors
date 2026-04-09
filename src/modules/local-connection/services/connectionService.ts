import type { SavedConnection, DiscoveryResult, RetryConfig, ConnectionInfo } from '../types';
import type { PingResponse } from '@/modules/local-server/types';
import { fetchTenantMachines } from '@/modules/device/api/deviceApi';

const SAVED_CONNECTION_KEY = 'fm:saved-connection';
const PING_TIMEOUT_MS = 3000;

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  backoffFactor: 2,
};

// ─── Local Storage ────────────────────────────────────────

export function getSavedConnection(): SavedConnection | null {
  try {
    const raw = localStorage.getItem(SAVED_CONNECTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConnection(conn: SavedConnection): void {
  localStorage.setItem(SAVED_CONNECTION_KEY, JSON.stringify(conn));
}

export function clearSavedConnection(): void {
  localStorage.removeItem(SAVED_CONNECTION_KEY);
}

// ─── Ping ─────────────────────────────────────────────────

/**
 * Faz ping no servidor local para verificar se está acessível.
 * Retorna o PingResponse ou null se falhar.
 */
export async function pingServer(baseUrl: string): Promise<PingResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/api/ping`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ok ? data as PingResponse : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Discovery ────────────────────────────────────────────

/**
 * Tenta descobrir o servidor local usando a cadeia de fallback:
 * 1. hostname.local (mDNS)
 * 2. IP salvo em localStorage
 * 3. IP registrado no Supabase
 *
 * Retorna o primeiro que responder ao ping.
 */
export async function discoverServer(
  tenantId: string,
  port: number,
): Promise<DiscoveryResult | null> {
  const saved = getSavedConnection();

  // 1. Hostname salvo (mDNS)
  if (saved?.hostname) {
    const url = `http://${saved.hostname}.local:${port}`;
    const ping = await pingServer(url);
    if (ping) {
      saveConnection({ ...saved, lastUsed: new Date().toISOString() });
      return { success: true, url, method: 'hostname', machineName: ping.machineName };
    }
  }

  // 2. IP salvo
  if (saved?.ip) {
    const url = `http://${saved.ip}:${port}`;
    const ping = await pingServer(url);
    if (ping) {
      saveConnection({ ...saved, lastUsed: new Date().toISOString() });
      return { success: true, url, method: 'saved-ip', machineName: ping.machineName };
    }
  }

  // 3. Buscar no Supabase
  try {
    const machines = await fetchTenantMachines(tenantId);
    for (const machine of machines) {
      // Tentar hostname primeiro
      const hostnameUrl = `http://${machine.machine_name}.local:${machine.porta}`;
      const hostPing = await pingServer(hostnameUrl);
      if (hostPing) {
        saveConnection({
          hostname: machine.machine_name,
          ip: machine.ip || '',
          port: machine.porta,
          lastUsed: new Date().toISOString(),
        });
        return { success: true, url: hostnameUrl, method: 'hostname', machineName: hostPing.machineName };
      }

      // Tentar IP do registro
      if (machine.ip) {
        const ipUrl = `http://${machine.ip}:${machine.porta}`;
        const ipPing = await pingServer(ipUrl);
        if (ipPing) {
          saveConnection({
            hostname: machine.machine_name,
            ip: machine.ip,
            port: machine.porta,
            lastUsed: new Date().toISOString(),
          });
          return { success: true, url: ipUrl, method: 'supabase-ip', machineName: ipPing.machineName };
        }
      }
    }
  } catch {
    // Supabase offline — não bloqueia
  }

  return null;
}

/**
 * Tenta conectar via URL manual (campo de fallback técnico).
 */
export async function connectManual(url: string): Promise<DiscoveryResult | null> {
  const clean = url.replace(/\/$/, '');
  const ping = await pingServer(clean);
  if (!ping) return null;

  // Extrair hostname e porta da URL
  try {
    const parsed = new URL(clean);
    saveConnection({
      hostname: ping.machineName || parsed.hostname,
      ip: parsed.hostname,
      port: parseInt(parsed.port) || 3847,
      lastUsed: new Date().toISOString(),
    });
  } catch { /* ignore parse errors */ }

  return { success: true, url: clean, method: 'manual', machineName: ping.machineName };
}

/**
 * Calcula o delay para a próxima tentativa com backoff exponencial.
 */
export function getRetryDelay(attempt: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Cria o estado inicial da conexão.
 */
export function createInitialConnectionInfo(): ConnectionInfo {
  return {
    status: 'disconnected',
    serverUrl: null,
    method: null,
    lastConnected: null,
    retryCount: 0,
  };
}
