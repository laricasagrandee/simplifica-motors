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
}

/** Configuração de conexão salva localmente */
export interface SavedConnection {
  hostname: string;
  ip: string;
  port: number;
  lastUsed: string;
}
