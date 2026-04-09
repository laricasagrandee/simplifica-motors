// Types
export type { DeviceType, DeviceMode, DeviceInfo, MachineRegistry, MachineRegistryPayload } from './types';

// Services
export {
  detectDeviceType,
  getDeviceMode,
  setDeviceMode,
  getMachineName,
  getLocalServerPort,
  getDeviceInfo,
  isTauri,
  isElectron, // deprecated alias
} from './services/deviceService';

// Hooks
export { useDeviceType } from './hooks/useDeviceType';
export { useDeviceMode } from './hooks/useDeviceMode';
export { useMachineRegistryQuery, useTenantMachines, useRegisterMachine } from './hooks/useMachineRegistry';

// API
export { registerMachine, fetchMachineRegistry, fetchTenantMachines } from './api/deviceApi';
