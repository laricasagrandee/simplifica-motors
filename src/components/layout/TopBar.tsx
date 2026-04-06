import { useNavigate } from 'react-router-dom';
import { Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificacoesBadge } from '@/components/shared/NotificacoesBadge';

export function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-card lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-0.5">
          <span className="font-display font-extrabold text-lg text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-lg text-primary">Motors</span>
        </div>
        <div className="flex gap-1 ml-2">
          <Button size="sm" variant="default" className="h-8 px-2 gap-1 bg-success text-success-foreground hover:bg-success/90 text-xs font-semibold"
            onClick={() => navigate('/os/rapida')}>
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">OS Rápida</span>
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2 gap-1 text-xs font-semibold"
            onClick={() => navigate('/os/nova')}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Nova OS</span>
          </Button>
        </div>
      </div>
      <NotificacoesBadge />
    </header>
  );
}
