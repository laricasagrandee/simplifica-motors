import { useState } from 'react';
import { Search } from 'lucide-react';
import { NotificacoesBadge } from '@/components/shared/NotificacoesBadge';
import { MobileSearchModal } from '@/components/shared/MobileSearchModal';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-card lg:hidden">
        <div className="flex items-baseline gap-0.5">
          <span className="font-display font-extrabold text-lg text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-lg text-primary">Motors</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <NotificacoesBadge />
        </div>
      </header>
      <MobileSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
