import { NotificacoesBadge } from '@/components/shared/NotificacoesBadge';

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-card lg:hidden">
      <div className="flex items-baseline gap-0.5">
        <span className="font-display font-extrabold text-lg text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-lg text-primary">Motors</span>
      </div>
      <NotificacoesBadge />
    </header>
  );
}
