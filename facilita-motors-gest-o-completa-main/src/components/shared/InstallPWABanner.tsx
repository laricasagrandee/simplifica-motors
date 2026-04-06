import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-dismissed') === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', '1');
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 shrink-0" />
        <span>Instale o Facilita Motors no seu celular para acesso rápido!</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={handleInstall} className="h-7 text-xs">
          Instalar App
        </Button>
        <button onClick={handleDismiss} className="p-1 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
