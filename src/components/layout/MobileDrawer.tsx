import { NavLink } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { sidebarGroups } from './AppSidebar';
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

  const groups = sidebarGroups
    .map(g => ({ ...g, items: g.items.filter(i => temPermissao(i.permissao)) }))
    .filter(g => g.items.length > 0);

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

        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {groups.map((g, gi) => (
            <DrawerGroup key={gi} group={g} onClose={onClose} />
          ))}
        </nav>
        <SidebarUserFooter />
      </div>
    </div>
  );
}

function DrawerGroup({ group, onClose }: { group: typeof sidebarGroups[0]; onClose: () => void }) {
  const [open, setOpen] = useState(group.defaultOpen);

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        <group.icon className="h-3 w-3" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-accent-light text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
                }`
              }>
              <item.icon className={cn("h-[18px] w-[18px]")} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
