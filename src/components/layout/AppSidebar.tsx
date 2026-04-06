import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ClipboardList, ShoppingCart,
  Wallet, BarChart3, FileBarChart, UserCog, FileText, Settings, Calendar, Calculator,
  ChevronDown, Cog, FolderOpen, TrendingUp, UsersRound,
} from 'lucide-react';
import { SidebarUserFooter } from './SidebarUserFooter';
import { NotificacoesBadge } from '@/components/shared/NotificacoesBadge';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { useAuthContext } from './AuthProvider';
import type { Acao } from '@/lib/permissions';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MenuItem { label: string; icon: typeof LayoutDashboard; path: string; permissao: Acao }

const operacaoItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permissao: 'ver_dashboard' },
  { label: 'Ordens de Serviço', icon: ClipboardList, path: '/os', permissao: 'gerenciar_os' },
  { label: 'PDV (Venda Rápida)', icon: ShoppingCart, path: '/pdv', permissao: 'usar_pdv' },
  { label: 'Agendamentos', icon: Calendar, path: '/agendamentos', permissao: 'gerenciar_os' },
];

const cadastroItems: MenuItem[] = [
  { label: 'Clientes', icon: Users, path: '/clientes', permissao: 'gerenciar_clientes' },
  { label: 'Peças & Estoque', icon: Package, path: '/pecas', permissao: 'gerenciar_pecas' },
];

const financeiroItems: MenuItem[] = [
  { label: 'Financeiro', icon: Wallet, path: '/financeiro', permissao: 'ver_financeiro' },
  { label: 'Notas Fiscais', icon: FileText, path: '/nf', permissao: 'emitir_nf' },
];

const analiseItems: MenuItem[] = [
  { label: 'Relatórios', icon: FileBarChart, path: '/relatorios', permissao: 'ver_relatorios' },
  { label: 'CMV', icon: Calculator, path: '/cmv', permissao: 'ver_cmv' },
  { label: 'DRE', icon: BarChart3, path: '/dre', permissao: 'ver_dre' },
];

const gestaoItems: MenuItem[] = [
  { label: 'Equipe', icon: UserCog, path: '/funcionarios', permissao: 'gerenciar_equipe' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes', permissao: 'ver_configuracoes' },
];

export const sidebarGroups = [
  { label: 'Operação', icon: Cog, items: operacaoItems, defaultOpen: true },
  { label: 'Cadastros', icon: FolderOpen, items: cadastroItems, defaultOpen: true },
  { label: 'Financeiro', icon: Wallet, items: financeiroItems, defaultOpen: true },
  { label: 'Análises', icon: TrendingUp, items: analiseItems, defaultOpen: false },
  { label: 'Gestão', icon: UsersRound, items: gestaoItems, defaultOpen: true },
];

export const menuItems: MenuItem[] = sidebarGroups.flatMap(g => g.items);

function useOSAbertasCount() {
  return useQuery({ queryKey: ['os-abertas-count'], queryFn: async () => {
    const { count } = await supabase.from('ordens_servico').select('id', { count: 'exact', head: true })
      .in('status', ['aberta', 'em_execucao', 'em_orcamento', 'aprovada']);
    return count ?? 0;
  }, refetchInterval: 60000 });
}

function SidebarItem({ item, isActive, badge }: { item: MenuItem; isActive: boolean; badge?: number }) {
  return (
    <NavLink to={item.path}
      className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive ? 'bg-accent-light text-primary font-semibold border-l-2 border-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}>
      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      <span className="flex-1">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{badge}</span>
      )}
    </NavLink>
  );
}

function SidebarGroupComp({ group, location, osBadge }: {
  group: typeof sidebarGroups[0]; location: ReturnType<typeof useLocation>; osBadge: number;
}) {
  const hasActive = group.items.some(i => location.pathname.startsWith(i.path));
  const [open, setOpen] = useState(group.defaultOpen || hasActive);
  if (group.items.length === 0) return null;

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <group.icon className="h-3 w-3" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map(item => (
            <SidebarItem key={item.path} item={item}
              isActive={location.pathname.startsWith(item.path)}
              badge={item.path === '/os' ? osBadge : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const { temPermissao } = useAuthContext();
  const { data: osCount } = useOSAbertasCount();

  const groups = sidebarGroups.map(g => ({
    ...g, items: g.items.filter(i => temPermissao(i.permissao)),
  })).filter(g => g.items.length > 0);

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
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        {groups.map((g, i) => (
          <SidebarGroupComp key={i} group={g} location={location} osBadge={osCount ?? 0} />
        ))}
      </nav>
      <SidebarUserFooter />
    </aside>
  );
}
