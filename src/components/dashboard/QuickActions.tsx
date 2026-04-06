import {
  ClipboardList, ShoppingCart, Users, Package, Wallet,
  Calendar, FileText, BarChart3, Settings, UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCaixaHoje } from '@/hooks/useCaixa';
import { cn } from '@/lib/utils';

const actions = [
  { label: 'Clientes', icon: Users, path: '/clientes', color: 'text-blue-600' },
  { label: 'Ordens de Serviço', icon: ClipboardList, path: '/os', color: 'text-emerald-600' },
  { label: 'Peças / Estoque', icon: Package, path: '/pecas', color: 'text-amber-600' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', color: 'text-purple-600' },
  { label: 'Agenda', icon: Calendar, path: '/agendamentos', color: 'text-cyan-600' },
  { label: 'Financeiro', id: 'caixa', icon: Wallet, path: '/financeiro', color: 'text-green-600' },
  { label: 'Notas Fiscais', icon: FileText, path: '/nf', color: 'text-rose-600' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios', color: 'text-indigo-600' },
  { label: 'Equipe', icon: UserPlus, path: '/funcionarios', color: 'text-orange-600' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes', color: 'text-slate-500' },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { data: caixa } = useCaixaHoje();
  const caixaAberto = caixa?.status === 'aberto';

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      {actions.map((a) => {
        const isCaixa = a.id === 'caixa';
        return (
          <button
            key={a.path}
            onClick={() => navigate(isCaixa ? '/financeiro?tab=caixa' : a.path)}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]',
              'min-h-[110px] sm:min-h-[120px]',
              isCaixa && !caixaAberto && 'border-destructive/50 animate-pulse'
            )}
          >
            <a.icon className={cn('h-8 w-8 sm:h-9 sm:w-9', a.color)} strokeWidth={1.6} />
            <span className="text-xs sm:text-sm font-semibold text-foreground text-center leading-tight">
              {a.label}
            </span>
            {isCaixa && (
              <span className={cn(
                'absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                caixaAberto
                  ? 'bg-success/15 text-success'
                  : 'bg-destructive/15 text-destructive'
              )}>
                {caixaAberto ? 'Aberto' : 'Fechado'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
