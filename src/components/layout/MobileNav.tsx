import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Wallet, Menu, Plus } from 'lucide-react';
import { useState } from 'react';
import { MobileDrawer } from './MobileDrawer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useOSPendentesCount() {
  return useQuery({ queryKey: ['os-abertas-count'], queryFn: async () => {
    const { count } = await supabase.from('ordens_servico').select('id', { count: 'exact', head: true })
      .in('status', ['aberta', 'em_execucao', 'em_orcamento', 'aprovada']);
    return count ?? 0;
  }, refetchInterval: 60000 });
}

const navItems = [
  { label: 'Início', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'OS', icon: ClipboardList, path: '/os', hasBadge: true },
];

const rightItems = [
  { label: 'Financeiro', icon: Wallet, path: '/financeiro' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: osCount } = useOSPendentesCount();

  const renderItem = (item: typeof navItems[0] & { hasBadge?: boolean }) => {
    const isActive = item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path);
    return (
      <NavLink key={item.path} to={item.path}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        <item.icon className="h-5 w-5" strokeWidth={1.75} />
        {item.hasBadge && osCount != null && osCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {osCount}
          </span>
        )}
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
        <nav className="flex items-end justify-around h-16 px-2 pb-1">
          {navItems.map(renderItem)}

          {/* Central green + button */}
          <button
            onClick={() => navigate('/os/rapida')}
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-success text-success-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform">
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </div>
          </button>

          {rightItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                {item.label}
              </NavLink>
            );
          })}

          <button onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
            Menu
          </button>
        </nav>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
