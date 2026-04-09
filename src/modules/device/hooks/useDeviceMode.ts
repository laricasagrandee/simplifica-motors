import { useState, useCallback } from 'react';
import { getDeviceMode, setDeviceMode as saveDeviceMode } from '../services/deviceService';
import type { DeviceMode } from '../types';

/**
 * Hook que retorna e permite alterar o modo de uso do sistema.
 */
export function useDeviceMode() {
  const [mode, setModeState] = useState<DeviceMode>(getDeviceMode);

  const setMode = useCallback((newMode: DeviceMode) => {
    saveDeviceMode(newMode);
    setModeState(newMode);
  }, []);

  return { mode, setMode };
}
