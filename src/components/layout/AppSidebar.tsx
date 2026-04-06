import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ClipboardList, ShoppingCart,
  Wallet, BarChart3, UserCog, Settings, Calendar, Wrench,
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

export const menuItems: MenuItem[] = [...mainItems, ...bottomItems];
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
    const badge = undefined;
    const isFinanceiro = item.path === '/financeiro';

    return (
      <NavLink key={item.path} to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] relative',
          isActive
            ? 'bg-primary/10 text-primary font-semibold border-l-[3px] border-primary pl-[9px]'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        )}>
        <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} strokeWidth={1.75} />
        <span className="flex-1">{item.label}</span>
        {badge != null && badge > 0 && (
          <span className="text-[10px] font-bold bg-destructive text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{badge}</span>
        )}
        {isFinanceiro && (
          <span className={cn(
            'w-2.5 h-2.5 rounded-full',
            caixaAberto ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
          )} />
        )}
      </NavLink>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-border bg-gradient-to-b from-white to-slate-50/80">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-extrabold text-lg text-foreground">Facilita</span>
              <span className="font-display font-extrabold text-lg text-primary">Motors</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Gestão de Oficina</p>
          </div>
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
        <div className="border-t border-border mb-3 mt-1" />
        <div className="space-y-1">
          {visibleBottom.map(renderItem)}
        </div>
      </div>
      <SidebarUserFooter />
    </aside>
  );
}
