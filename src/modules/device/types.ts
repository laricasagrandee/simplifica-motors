/** Tipo de dispositivo detectado */
export type DeviceType = 'desktop' | 'mobile';

/** Modo de uso do sistema */
export type DeviceMode = 'desktop-only' | 'mobile-only' | 'desktop-mobile';

/** Informações do dispositivo atual */
export interface DeviceInfo {
  type: DeviceType;
  mode: DeviceMode;
  machineName: string | null;
}

/** Registro de máquina no Supabase (tabela machine_registry) */
export interface MachineRegistry {
  id: string;
  email: string;
  tenant_id: string;
  machine_name: string;
  porta: number;
  ip: string | null;
  modo: DeviceMode;
  atualizado_em: string;
  criado_em: string;
}

/** Payload para registrar/atualizar máquina */
export interface MachineRegistryPayload {
  email: string;
  tenant_id: string;
  machine_name: string;
  porta: number;
  ip?: string;
  modo: DeviceMode;
}
