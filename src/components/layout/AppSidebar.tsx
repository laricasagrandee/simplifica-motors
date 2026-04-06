import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ClipboardList, ShoppingCart,
  Wallet, BarChart3, UserCog, Settings, Calendar,
} from 'lucide-react';
import { SidebarUserFooter } from './SidebarUserFooter';
import { NotificacoesBadge } from '@/components/shared/NotificacoesBadge';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { useAuthContext } from './AuthProvider';
import type { Acao } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCaixaHoje } from '@/hooks/useCaixa';

export interface MenuItem { label: string; icon: typeof LayoutDashboard; path: string; permissao: Acao }

const mainItems: MenuItem[] = [
  { label: 'Início', icon: LayoutDashboard, path: '/dashboard', permissao: 'ver_dashboard' },
  { label: 'Ordens de Serviço', icon: ClipboardList, path: '/os', permissao: 'gerenciar_os' },
  { label: 'Clientes', icon: Users, path: '/clientes', permissao: 'gerenciar_clientes' },
  { label: 'Peças / Estoque', icon: Package, path: '/pecas', permissao: 'gerenciar_pecas' },
  { label: 'Agenda', icon: Calendar, path: '/agendamentos', permissao: 'gerenciar_os' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', permissao: 'usar_pdv' },
  { label: 'Financeiro', icon: Wallet, path: '/financeiro', permissao: 'ver_financeiro' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios', permissao: 'ver_relatorios' },
];

const bottomItems: MenuItem[] = [
  { label: 'Equipe', icon: UserCog, path: '/funcionarios', permissao: 'gerenciar_equipe' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes', permissao: 'ver_configuracoes' },
];

// Keep menuItems export for compatibility
export const menuItems: MenuItem[] = [...mainItems, ...bottomItems];

// Keep sidebarGroups export for MobileDrawer compatibility
export const sidebarGroups = [
  { label: 'Principal', icon: LayoutDashboard, items: mainItems, defaultOpen: true },
  { label: 'Gestão', icon: UserCog, items: bottomItems, defaultOpen: true },
];

function useOSAbertasCount() {
  return useQuery({ queryKey: ['os-abertas-count'], queryFn: async () => {
    const { count } = await supabase.from('ordens_servico').select('id', { count: 'exact', head: true })
      .in('status', ['aberta', 'em_execucao', 'em_orcamento', 'aprovada']);
    return count ?? 0;
  }, refetchInterval: 60000 });
}

export function AppSidebar() {
  const location = useLocation();
  const { temPermissao } = useAuthContext();
  const { data: osCount } = useOSAbertasCount();
  const { data: caixa } = useCaixaHoje();
  const caixaAberto = caixa?.status === 'aberto';

  const visibleMain = mainItems.filter(i => temPermissao(i.permissao));
  const visibleBottom = bottomItems.filter(i => temPermissao(i.permissao));

  const renderItem = (item: MenuItem) => {
    const isActive = item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path);
    const badge = item.path === '/os' ? (osCount ?? 0) : undefined;
    const isFinanceiro = item.path === '/financeiro';

    return (
      <NavLink key={item.path} to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px]',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}>
        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        <span className="flex-1">{item.label}</span>
        {badge != null && badge > 0 && (
          <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{badge}</span>
        )}
        {isFinanceiro && (
          <span className={cn('w-2 h-2 rounded-full', caixaAberto ? 'bg-success' : 'bg-destructive')} />
        )}
      </NavLink>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-border bg-card">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-extrabold text-xl text-foreground">Facilita</span>
            <span className="font-display font-extrabold text-xl text-primary">Motors</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Gestão de Oficina</p>
        </div>
        <NotificacoesBadge />
      </div>
      <div className="px-3 pt-3">
        <GlobalSearch />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleMain.map(renderItem)}
      </nav>
      <div className="px-3 pb-2">
        <div className="border-t border-border mb-2" />
        <div className="space-y-1">
          {visibleBottom.map(renderItem)}
        </div>
      </div>
      <SidebarUserFooter />
    </aside>
  );
}
