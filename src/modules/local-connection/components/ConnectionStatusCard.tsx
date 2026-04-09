import { Wifi, WifiOff, Loader2, RefreshCw, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { ConnectionInfo } from '../types';

interface Props {
  connection: ConnectionInfo;
  onReconnect: () => void;
  onConnectByUrl: (url: string) => void;
}

/**
 * Card de status da conexão do celular com o PC.
 * Mostra na tela após login no modo desktop-mobile.
 */
export function ConnectionStatusCard({ connection, onReconnect, onConnectByUrl }: Props) {
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      const url = manualUrl.startsWith('http') ? manualUrl : `http://${manualUrl}`;
      onConnectByUrl(url);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        {connection.status === 'connected' && (
          <>
            <div className="rounded-lg bg-primary/10 p-2">
              <Wifi className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">Conectado ao computador</p>
              <p className="text-xs text-muted-foreground">
                via {connection.method === 'hostname' ? 'nome da máquina' : 'IP'}
              </p>
            </div>
          </>
        )}

        {connection.status === 'connecting' && (
          <>
            <div className="rounded-lg bg-warning-light p-2">
              <Loader2 className="h-5 w-5 text-warning animate-spin" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">Procurando computador...</p>
              <p className="text-xs text-muted-foreground">
                Tentativa {connection.retryCount + 1} — verifique se o app está aberto no PC
              </p>
            </div>
          </>
        )}

        {connection.status === 'error' && (
          <>
            <div className="rounded-lg bg-danger-light p-2">
              <WifiOff className="h-5 w-5 text-danger" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">Computador não encontrado</p>
              <p className="text-xs text-muted-foreground">
                {connection.error || 'Verifique se o app está aberto no PC e na mesma rede Wi-Fi.'}
              </p>
            </div>
          </>
        )}

        {connection.status === 'disconnected' && (
          <>
            <div className="rounded-lg bg-muted p-2">
              <Monitor className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">Desconectado</p>
              <p className="text-xs text-muted-foreground">Nenhuma conexão ativa com o computador.</p>
            </div>
          </>
        )}
      </div>

      {(connection.status === 'error' || connection.status === 'disconnected') && (
        <div className="space-y-2">
          <Button onClick={onReconnect} variant="outline" size="sm" className="w-full gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>

          <button
            onClick={() => setShowManual(!showManual)}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            {showManual ? 'Fechar' : 'Conectar manualmente'}
          </button>

          {showManual && (
            <form onSubmit={handleManualConnect} className="flex gap-2">
              <Input
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                placeholder="192.168.1.100:3847"
                className="h-9 text-sm"
              />
              <Button type="submit" size="sm" className="h-9 px-3">
                Conectar
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
