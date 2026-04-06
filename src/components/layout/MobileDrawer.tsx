import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { menuItems } from './AppSidebar';
import { SidebarUserFooter } from './SidebarUserFooter';
import { useCaixaHoje } from '@/hooks/useCaixa';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { temPermissao } = useAuthContext();
  const { data: caixa } = useCaixaHoje();

  if (!open) return null;

  const items = menuItems.filter(i => temPermissao(i.permissao));
  const caixaAberto = caixa?.status === 'aberto';

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl animate-fade-in flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-extrabold text-lg text-foreground">Facilita</span>
            <span className="font-display font-extrabold text-lg text-primary">Motors</span>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        {/* Caixa status */}
        <div className={cn('mx-4 mt-4 rounded-lg p-3 text-sm font-medium flex items-center gap-2',
          caixaAberto ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
          <span>{caixaAberto ? '✅' : '❌'}</span>
          Caixa {caixaAberto ? 'Aberto' : 'Fechado'}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                )
              }>
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <SidebarUserFooter />
      </div>
    </div>
  );
}
