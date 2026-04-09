// Types
export type { ConnectionStatus, DiscoveryMethod, ConnectionInfo, SavedConnection, DiscoveryResult, RetryConfig } from './types';

// Services
export {
  discoverServer,
  connectManual,
  pingServer,
  getSavedConnection,
  saveConnection,
  clearSavedConnection,
  getRetryDelay,
  createInitialConnectionInfo,
  DEFAULT_RETRY_CONFIG,
} from './services/connectionService';

// Hooks
export { useLocalConnection } from './hooks/useLocalConnection';

// Components
export { ConnectionStatusCard } from './components/ConnectionStatusCard';
