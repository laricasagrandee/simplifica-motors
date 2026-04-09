import { useState, useEffect, useCallback } from 'react';
import { isTauri, getDeviceMode } from '@/modules/device';
import {
  canStartServer,
  requestStartServer,
  requestStopServer,
} from '../services/serverService';
import type { LocalServerInfo } from '../types';

const INITIAL_STATE: LocalServerInfo = {
  status: 'stopped',
  port: 3847,
  hostname: null,
  startedAt: null,
};

/**
 * Hook para controlar o servidor local no PC.
 * Inicia automaticamente no Tauri quando o modo é desktop-only ou desktop-mobile.
 */
export function useLocalServer() {
  const [server, setServer] = useState<LocalServerInfo>(INITIAL_STATE);

  const start = useCallback(async () => {
    if (!canStartServer()) return;
    setServer(prev => ({ ...prev, status: 'starting' }));
    const result = await requestStartServer();
    setServer(result);
  }, []);

  const stop = useCallback(async () => {
    await requestStopServer();
    setServer(INITIAL_STATE);
  }, []);

  // Auto-start no Tauri quando modo requer servidor
  useEffect(() => {
    if (!isTauri()) return;

    const mode = getDeviceMode();
    if (mode === 'desktop-only' || mode === 'desktop-mobile') {
      start();
    }
  }, [start]);

  return {
    server,
    start,
    stop,
    isRunning: server.status === 'running',
    isTauriEnv: isTauri(),
  };
}
