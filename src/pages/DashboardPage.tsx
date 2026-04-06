import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { RecentOS } from '@/components/dashboard/RecentOS';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Zap, Plus, ClipboardList, Users, Package, Wallet, Calendar, ShoppingCart } from 'lucide-react';
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
  { label: 'Ordens de Serviço', icon: ClipboardList, path: '/os', color: 'text-emerald-600' },
  { label: 'Clientes', icon: Users, path: '/clientes', color: 'text-blue-600' },
  { label: 'Peças / Estoque', icon: Package, path: '/pecas', color: 'text-amber-600' },
  { label: 'Financeiro', icon: Wallet, path: '/financeiro', color: 'text-green-600', id: 'caixa' },
  { label: 'Agenda', icon: Calendar, path: '/agendamentos', color: 'text-cyan-600' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', color: 'text-purple-600' },
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
              className="gap-2 bg-success text-success-foreground hover:bg-success/90 min-h-[56px] sm:min-h-[44px] px-6 text-base sm:text-sm font-semibold shadow-md flex-1 sm:flex-initial"
            >
              <Zap className="h-5 w-5 sm:h-4 sm:w-4" /> Abrir OS Rápida
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/os/nova')}
              className="gap-2 min-h-[56px] sm:min-h-[44px] px-6 text-base sm:text-sm font-semibold flex-1 sm:flex-initial"
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" /> Nova OS Completa
            </Button>
          </div>
        </div>

        {/* 2) 3 metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">OS em Andamento</p>
            {osAndamento.isLoading ? <Skeleton className="h-9 w-16" /> : (
              <span className="text-3xl font-display font-bold text-foreground">{osAndamento.data}</span>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Faturamento Hoje</p>
            {faturamento.isLoading ? <Skeleton className="h-9 w-24" /> : (
              <MoneyDisplay valor={faturamento.data ?? 0} className="text-3xl font-bold text-foreground" />
            )}
          </div>
          <div className={`bg-card border rounded-xl p-5 animate-fade-in ${caixaAberto ? 'border-success/40' : 'border-destructive/40'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Caixa</p>
            {caixaLoading ? <Skeleton className="h-9 w-20" /> : caixaAberto ? (
              <div>
                <MoneyDisplay valor={saldoCaixa} className="text-3xl font-bold text-success" />
                <span className="text-xs text-success font-medium ml-2">Aberto</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-destructive">Fechado</span>
              </div>
            )}
          </div>
        </div>

        {/* 3) Last 5 OS */}
        <RecentOS data={ultimasOS ?? []} loading={osLoading} />

        {/* 4) Quick actions - 6 buttons */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Menu Principal</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((a) => {
              const isCaixa = a.id === 'caixa';
              return (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] min-h-[110px]"
                >
                  <a.icon className={`h-8 w-8 ${a.color}`} strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm font-semibold text-foreground text-center leading-tight">{a.label}</span>
                  {isCaixa && (
                    <span className={`absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      caixaAberto ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    }`}>
                      {caixaAberto ? 'Aberto' : 'Fechado'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
