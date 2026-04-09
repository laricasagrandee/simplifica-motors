import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Monitor, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSettings, useUpdateAppSetting } from '@/modules/license/services/useAppSettings';

export function AdminConfigGeral() {
  const { data: settings, isLoading } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  const [desktopUrl, setDesktopUrl] = useState('');

  useEffect(() => {
    if (settings?.download_desktop_url) {
      setDesktopUrl(settings.download_desktop_url);
    }
  }, [settings]);

  const handleSalvar = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'download_desktop_url', value: desktopUrl.trim() });
      toast.success('Configuração salva!');
    } catch {
      toast.error('Erro ao salvar configuração');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-slate-300 flex items-center gap-1.5 mb-1.5">
          <Monitor className="h-3.5 w-3.5" /> Link de Download do Desktop
        </Label>
        <Input
          type="url"
          value={desktopUrl}
          onChange={(e) => setDesktopUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="bg-slate-700 border-slate-600 text-white h-12"
        />
        <p className="text-xs text-slate-500 mt-1">
          Este link será exibido na tela de login para download do app desktop.
        </p>
      </div>

      <Button
        onClick={handleSalvar}
        disabled={updateSetting.isPending || !desktopUrl.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12"
      >
        {updateSetting.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Salvar Configuração
          </>
        )}
      </Button>
    </div>
  );
}
