/** Status da conexão com o servidor local */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** Método usado para descobrir o servidor */
export type DiscoveryMethod = 'hostname' | 'saved-ip' | 'supabase-ip' | 'manual';

/** Informações da conexão atual */
export interface ConnectionInfo {
  status: ConnectionStatus;
  serverUrl: string | null;
  method: DiscoveryMethod | null;
  lastConnected: string | null;
  retryCount: number;
  error?: string;
}

/** Configuração de conexão salva localmente */
export interface SavedConnection {
  hostname: string;
  ip: string;
  port: number;
  lastUsed: string;
}

/** Resultado de uma tentativa de descoberta */
export interface DiscoveryResult {
  success: boolean;
  url: string;
  method: DiscoveryMethod;
  machineName?: string;
}

/** Configuração de retry */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}
