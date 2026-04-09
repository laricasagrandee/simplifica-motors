/** Status do servidor local */
export type ServerStatus = 'stopped' | 'starting' | 'running' | 'error';

/** Informações do servidor local */
export interface LocalServerInfo {
  status: ServerStatus;
  port: number;
  hostname: string | null;
  startedAt: string | null;
}

/** Resposta do endpoint /api/ping */
export interface PingResponse {
  ok: true;
  serverTime: string;
  machineName: string;
  version: string;
}
