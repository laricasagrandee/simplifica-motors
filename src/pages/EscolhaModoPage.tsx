import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeviceMode } from '@/modules/device';
import type { DeviceMode } from '@/modules/device';

const modos: { value: DeviceMode; icon: typeof Monitor; title: string; desc: string }[] = [
  {
    value: 'mobile-only',
    icon: Smartphone,
    title: 'Só no celular',
    desc: 'Tudo funciona direto no celular, sem precisar de computador.',
  },
  {
    value: 'desktop-only',
    icon: Monitor,
    title: 'Só no computador',
    desc: 'Tudo funciona no PC, sem precisar do celular.',
  },
  {
    value: 'desktop-mobile',
    icon: Wifi,
    title: 'Computador + Celular',
    desc: 'O celular se conecta ao computador pela rede Wi-Fi da oficina.',
  },
];

export default function EscolhaModoPage() {
  const navigate = useNavigate();
  const { setMode } = useDeviceMode();

  const handleSelect = (mode: DeviceMode) => {
    setMode(mode);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-baseline justify-center gap-0.5 mb-2">
          <span className="font-display font-extrabold text-2xl text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-2xl text-primary">Motors</span>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Como você vai usar o sistema?
        </p>

        <div className="space-y-3">
          {modos.map(({ value, icon: Icon, title, desc }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="w-full flex items-start gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-foreground mb-0.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Você pode alterar isso depois em Configurações.
        </p>
      </div>
    </div>
  );
}
