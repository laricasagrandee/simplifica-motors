import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Wallet, Menu, Plus } from 'lucide-react';
import { useState } from 'react';
import { MobileDrawer } from './MobileDrawer';
import { SpeedDial } from './SpeedDial';

const bottomItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'OS', icon: ClipboardList, path: '/os' },
];

const rightItems = [
  { label: 'Financeiro', icon: Wallet, path: '/financeiro' },
];

export function MobileNav() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const renderItem = (item: typeof bottomItems[0]) => {
    const isActive = location.pathname.startsWith(item.path);
    return (
      <NavLink key={item.path} to={item.path}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        <item.icon className="h-5 w-5" strokeWidth={1.75} />
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
        <nav className="flex items-center justify-around h-16 px-2">
          {bottomItems.map(renderItem)}

          {/* FAB placeholder spacer */}
          <div className="w-14" />

          {rightItems.map(renderItem)}

          <button onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
            Menu
          </button>
        </nav>
      </div>

      {/* FAB */}
      {!speedDialOpen && (
        <button onClick={() => setSpeedDialOpen(true)}
          className="fixed bottom-20 right-4 z-50 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform">
          <Plus className="h-6 w-6" />
        </button>
      )}

      <SpeedDial open={speedDialOpen} onClose={() => setSpeedDialOpen(false)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
