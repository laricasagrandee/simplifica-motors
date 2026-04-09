import { useState, useEffect } from 'react';
import { detectDeviceType } from '../services/deviceService';
import type { DeviceType } from '../types';

/**
 * Hook reativo que retorna o tipo de dispositivo (desktop/mobile).
 * Atualiza se a janela for redimensionada drasticamente.
 */
export function useDeviceType(): DeviceType {
  const [type, setType] = useState<DeviceType>(detectDeviceType);

  useEffect(() => {
    const handleResize = () => {
      setType(detectDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return type;
}
