import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { RecentOS } from '@/components/dashboard/RecentOS';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import {
  Zap, Plus, ClipboardList, Users, Package, Wallet, Calendar, ShoppingCart,
  ArrowUpRight, DollarSign, LayoutDashboard,
} from 'lucide-react';
import { useOSAbertas, useFaturamentoHoje } from '@/hooks/useDashboardMetrics';
import { useCaixaHoje } from '@/hooks/useCaixa';
import { useUltimasOS } from '@/hooks/useDashboardOS';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useOSEmAndamento() {
  return useQuery({
    queryKey: ['dashboard-os-andamento'],
    queryFn: async () => {
      const { count } = await supabase.from('ordens_servico')
        .select('id', { count: 'exact', head: true })
        .in('status', ['aberta', 'em_execucao', 'em_orcamento', 'aprovada']);
      return count ?? 0;
    },
    staleTime: 30000,
  });
}

const quickActions = [
  { label: 'Ordens de Serviço', icon: ClipboardList, path: '/os', bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { label: 'Clientes', icon: Users, path: '/clientes', bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: 'Peças / Estoque', icon: Package, path: '/pecas', bg: 'bg-amber-100', color: 'text-amber-600' },
  { label: 'Financeiro', icon: Wallet, path: '/financeiro', bg: 'bg-green-100', color: 'text-green-600', id: 'caixa' },
  { label: 'Agenda', icon: Calendar, path: '/agendamentos', bg: 'bg-cyan-100', color: 'text-cyan-600' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', bg: 'bg-purple-100', color: 'text-purple-600' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const osAndamento = useOSEmAndamento();
  const faturamento = useFaturamentoHoje();
  const { data: caixa, isLoading: caixaLoading } = useCaixaHoje();
  const { data: ultimasOS, isLoading: osLoading } = useUltimasOS();

  const caixaAberto = caixa?.status === 'aberto';
  const saldoCaixa = caixaAberto
    ? (caixa!.saldo_abertura ?? 0) + (caixa!.total_entradas ?? 0) - (caixa!.total_saidas ?? 0)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 1) Greeting + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DashboardGreeting />
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => navigate('/os/rapida')}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 min-h-[56px] sm:min-h-[44px] px-6 text-base sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 flex-1 sm:flex-initial rounded-xl"
            >
              <Zap className="h-5 w-5 sm:h-4 sm:w-4" /> Abrir OS Rápida
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/os/nova')}
              className="gap-2 min-h-[56px] sm:min-h-[44px] px-6 text-base sm:text-sm font-semibold flex-1 sm:flex-initial rounded-xl border-2"
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" /> Nova OS Completa
            </Button>
          </div>
        </div>

        {/* 2) 3 metric cards with gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OS em Andamento */}
          <button
            onClick={() => navigate('/os')}
            className="relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 rounded-2xl p-6 text-left animate-fade-in group hover:shadow-md transition-shadow"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <ClipboardList className="h-10 w-10 text-blue-400" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 mb-2">OS em Andamento</p>
            {osAndamento.isLoading ? <Skeleton className="h-10 w-16" /> : (
              <span className="text-4xl font-display font-bold text-blue-900">{osAndamento.data}</span>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-blue-500 font-medium">Atualizado agora</span>
            </div>
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
          </button>

          {/* Faturamento Hoje */}
          <button
            onClick={() => navigate('/financeiro')}
            className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/60 rounded-2xl p-6 text-left animate-fade-in animate-fade-in-delay-1 group hover:shadow-md transition-shadow"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <DollarSign className="h-10 w-10 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 mb-2">Faturamento Hoje</p>
            {faturamento.isLoading ? <Skeleton className="h-10 w-24" /> : (
              <MoneyDisplay valor={faturamento.data ?? 0} className="text-4xl font-bold text-emerald-900" />
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-500 font-medium">Atualizado agora</span>
            </div>
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
          </button>

          {/* Caixa */}
          <button
            onClick={() => navigate('/financeiro')}
            className={`relative rounded-2xl p-6 text-left animate-fade-in animate-fade-in-delay-2 group hover:shadow-md transition-shadow border ${
              caixaAberto
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200/60'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200/60'
            }`}
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Wallet className={`h-10 w-10 ${caixaAberto ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${caixaAberto ? 'text-green-600/70' : 'text-red-600/70'}`}>Caixa</p>
            {caixaLoading ? <Skeleton className="h-10 w-20" /> : caixaAberto ? (
              <div>
                <MoneyDisplay valor={saldoCaixa} className="text-4xl font-bold text-green-900" />
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-200/60 text-green-700">Aberto</span>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-bold text-red-800">Fechado</span>
                <p className="text-xs text-red-500 font-medium mt-1">Abrir Caixa →</p>
              </div>
            )}
            <ArrowUpRight className={`absolute bottom-4 right-4 h-4 w-4 ${caixaAberto ? 'text-green-300 group-hover:text-green-500' : 'text-red-300 group-hover:text-red-500'} transition-colors`} />
          </button>
        </div>

        {/* 3) Last 5 OS */}
        <RecentOS data={ultimasOS ?? []} loading={osLoading} />

        {/* 4) Quick actions - 6 buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickActions.map((a, i) => {
            const isCaixa = a.id === 'caixa';
            return (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-1 active:scale-[0.97] min-h-[120px] animate-fade-in`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`w-12 h-12 rounded-full ${a.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <a.icon className={`h-6 w-6 ${a.color}`} strokeWidth={1.6} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground text-center leading-tight">{a.label}</span>
                {isCaixa && (
                  <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${
                    caixaAberto ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
