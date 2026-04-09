import { useState, useEffect, useCallback, useRef } from 'react';
import { getDeviceMode, getLocalServerPort } from '@/modules/device';
import {
  discoverServer,
  connectManual,
  pingServer,
  getSavedConnection,
  clearSavedConnection,
  getRetryDelay,
  createInitialConnectionInfo,
  DEFAULT_RETRY_CONFIG,
} from '../services/connectionService';
import type { ConnectionInfo } from '../types';

const HEALTH_CHECK_INTERVAL_MS = 30_000; // 30s

/**
 * Hook principal de conexão do celular com o PC.
 *
 * Fluxo:
 * 1. Após login, se modo = desktop-mobile, inicia descoberta automática.
 * 2. Tenta hostname.local → IP salvo → IP do Supabase.
 * 3. Se conectar, faz health checks periódicos.
 * 4. Se perder conexão, reconecta automaticamente com backoff.
 */
export function useLocalConnection(tenantId: string | null) {
  const [connection, setConnection] = useState<ConnectionInfo>(createInitialConnectionInfo);
  const retryRef = useRef(0);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const mode = getDeviceMode();
  const port = getLocalServerPort();
  const shouldConnect = mode === 'desktop-mobile' && !!tenantId;

  // ── Conectar ────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!tenantId) return;

    setConnection(prev => ({ ...prev, status: 'connecting', error: undefined }));

    const result = await discoverServer(tenantId, port);

    if (!mountedRef.current) return;

    if (result) {
      retryRef.current = 0;
      setConnection({
        status: 'connected',
        serverUrl: result.url,
        method: result.method,
        lastConnected: new Date().toISOString(),
        retryCount: 0,
      });
    } else {
      const retryCount = retryRef.current + 1;
      setConnection(prev => ({
        ...prev,
        status: retryCount >= DEFAULT_RETRY_CONFIG.maxRetries ? 'error' : 'connecting',
        retryCount,
        error: retryCount >= DEFAULT_RETRY_CONFIG.maxRetries
          ? 'Não foi possível encontrar o computador na rede. Verifique se o app está aberto no PC.'
          : undefined,
      }));

      // Retry com backoff
      if (retryCount < DEFAULT_RETRY_CONFIG.maxRetries) {
        retryRef.current = retryCount;
        const delay = getRetryDelay(retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      }
    }
  }, [tenantId, port]);

  // ── Reconectar manualmente ──────────────────────────────
  const reconnect = useCallback(() => {
    retryRef.current = 0;
    connect();
  }, [connect]);

  // ── Conectar manualmente via URL ────────────────────────
  const connectByUrl = useCallback(async (url: string) => {
    setConnection(prev => ({ ...prev, status: 'connecting', error: undefined }));
    const result = await connectManual(url);

    if (!mountedRef.current) return;

    if (result) {
      retryRef.current = 0;
      setConnection({
        status: 'connected',
        serverUrl: result.url,
        method: 'manual',
        lastConnected: new Date().toISOString(),
        retryCount: 0,
      });
    } else {
      setConnection(prev => ({
        ...prev,
        status: 'error',
        error: 'Não foi possível conectar neste endereço.',
      }));
    }
  }, []);

  // ── Desconectar ─────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    clearSavedConnection();
    retryRef.current = 0;
    setConnection(createInitialConnectionInfo());
  }, []);

  // ── Health check periódico ──────────────────────────────
  useEffect(() => {
    if (connection.status !== 'connected' || !connection.serverUrl) {
      if (healthIntervalRef.current) {
        clearInterval(healthIntervalRef.current);
        healthIntervalRef.current = null;
      }
      return;
    }

    const url = connection.serverUrl;

    healthIntervalRef.current = setInterval(async () => {
      const ping = await pingServer(url);
      if (!mountedRef.current) return;

      if (!ping) {
        // Perdeu conexão → reconectar automaticamente
        if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
        healthIntervalRef.current = null;
        retryRef.current = 0;
        setConnection(prev => ({
          ...prev,
          status: 'connecting',
          error: undefined,
        }));
        connect();
      }
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      if (healthIntervalRef.current) {
        clearInterval(healthIntervalRef.current);
        healthIntervalRef.current = null;
      }
    };
  }, [connection.status, connection.serverUrl, connect]);

  // ── Auto-connect no mount ───────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    if (shouldConnect) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
    };
  }, [shouldConnect, connect]);

  return {
    connection,
    connect: reconnect,
    connectByUrl,
    disconnect,
    isConnected: connection.status === 'connected',
    isConnecting: connection.status === 'connecting',
    hasError: connection.status === 'error',
  };
}
