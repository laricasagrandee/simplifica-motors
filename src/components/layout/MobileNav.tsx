import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Wallet, Menu, Plus } from 'lucide-react';
import { useState } from 'react';
import { MobileDrawer } from './MobileDrawer';

const navItems = [
  { label: 'Início', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'OS', icon: ClipboardList, path: '/os' },
];

const rightItems = [
  { label: 'Financeiro', icon: Wallet, path: '/financeiro' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const renderItem = (item: typeof navItems[0]) => {
    const isActive = item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path);
    return (
      <NavLink key={item.path} to={item.path}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        <item.icon className="h-6 w-6" strokeWidth={1.75} />
        {item.label}
        {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
      </NavLink>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <nav className="flex items-end justify-around h-16 px-2 pb-[max(4px,env(safe-area-inset-bottom))]">
          {navItems.map(renderItem)}

          <button
            onClick={() => navigate('/os/rapida')}
            className="flex flex-col items-center -mt-7"
          >
            <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-white">
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </div>
          </button>

          {rightItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="h-6 w-6" strokeWidth={1.75} />
                {item.label}
                {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </NavLink>
            );
          })}

          <button onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
            <Menu className="h-6 w-6" strokeWidth={1.75} />
            Menu
          </button>
        </nav>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

