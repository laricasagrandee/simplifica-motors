import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Zap, Plus, ClipboardList, Users, Package, Wallet, Calendar, ShoppingCart,
  ArrowUpRight, DollarSign, CheckCircle2, ArrowRight, TrendingUp, AlertTriangle, BarChart3,
} from 'lucide-react';
import { useFaturamentoHoje, useOSConcluidasHoje, usePecasAlerta, useTicketMedioOS } from '@/hooks/useDashboardStats';
import { useCaixaHoje } from '@/hooks/useCaixa';
import { useUltimasOS } from '@/hooks/useDashboardOS';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatarMoeda } from '@/lib/formatters';
import type { StatusOS } from '@/types/database';

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

function useOSProntas() {
  return useQuery({
    queryKey: ['dashboard-os-prontas'],
    queryFn: async () => {
      const { count } = await supabase.from('ordens_servico')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'concluida');
      return count ?? 0;
    },
    staleTime: 30000,
  });
}

const quickActions = [
  { label: 'OS', icon: ClipboardList, path: '/os', bg: 'bg-emerald-700', color: 'text-white' },
  { label: 'Clientes', icon: Users, path: '/clientes', bg: 'bg-blue-600', color: 'text-white' },
  { label: 'Peças', icon: Package, path: '/pecas', bg: 'bg-amber-500', color: 'text-white' },
  { label: 'Financeiro', icon: Wallet, path: '/financeiro', bg: 'bg-green-600', color: 'text-white', id: 'caixa' },
  { label: 'Agenda', icon: Calendar, path: '/agendamentos', bg: 'bg-cyan-600', color: 'text-white' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', bg: 'bg-purple-600', color: 'text-white' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const osAndamento = useOSEmAndamento();
  const osProntas = useOSProntas();
  const faturamento = useFaturamentoHoje();
  const { data: caixa, isLoading: caixaLoading } = useCaixaHoje();
  const { data: ultimasOS, isLoading: osLoading } = useUltimasOS();
  const concluidasHoje = useOSConcluidasHoje();
  const pecasAlerta = usePecasAlerta();
  const ticketMedio = useTicketMedioOS();

  const caixaAberto = caixa?.status === 'aberto';
  const saldoCaixa = caixaAberto
    ? (caixa!.saldo_abertura ?? 0) + (caixa!.total_entradas ?? 0) - (caixa!.total_saidas ?? 0)
    : 0;

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 -m-4 sm:-m-6 p-4 sm:p-6 space-y-4 sm:space-y-5">

        {/* LINHA 1 — Saudação + Botões */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <DashboardGreeting />
          <div className="flex gap-2.5 shrink-0">
            <Button
              onClick={() => navigate('/os/rapida')}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 min-h-[52px] sm:min-h-[42px] px-5 text-sm font-semibold shadow-lg shadow-emerald-600/20 flex-1 sm:flex-initial rounded-xl"
            >
              <Zap className="h-4 w-4" /> Abrir OS Rápida
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/os/nova')}
              className="gap-2 min-h-[52px] sm:min-h-[42px] px-5 text-sm font-semibold flex-1 sm:flex-initial rounded-xl border-2"
            >
              <Plus className="h-4 w-4" /> Nova OS Completa
            </Button>
          </div>
        </div>

        {/* LINHA 2 — 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 — OS em Andamento (destaque verde escuro) */}
          <button
            onClick={() => navigate('/os')}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in"
          >
            <ClipboardList className="absolute -top-2 -right-2 h-16 w-16 text-white/10" strokeWidth={1.2} />
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">OS em Andamento</p>
            {osAndamento.isLoading ? <Skeleton className="h-9 w-14 bg-white/20" /> : (
              <span className="text-3xl font-display font-bold text-white">{osAndamento.data}</span>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <span className="text-[10px] text-white/60 font-medium">Atualizado agora</span>
            </div>
            <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>

          {/* Card 2 — Faturamento Hoje */}
          <button
            onClick={() => navigate('/financeiro')}
            className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in"
            style={{ animationDelay: '50ms' }}
          >
            <DollarSign className="absolute -top-1 -right-1 h-14 w-14 text-emerald-500/10" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Faturamento Hoje</p>
            {faturamento.isLoading ? <Skeleton className="h-9 w-24" /> : (
              <MoneyDisplay valor={faturamento.data ?? 0} className="text-3xl font-bold text-slate-900" />
            )}
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">Atualizado agora</span>
            </div>
            <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* Card 3 — OS Prontas */}
          <button
            onClick={() => navigate('/os')}
            className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <CheckCircle2 className="absolute -top-1 -right-1 h-14 w-14 text-emerald-500/10" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">OS Prontas</p>
            {osProntas.isLoading ? <Skeleton className="h-9 w-14" /> : (
              <span className="text-3xl font-display font-bold text-slate-900">{osProntas.data}</span>
            )}
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-medium">Aguardando retirada</span>
            </div>
            <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* Card 4 — Caixa */}
          <button
            onClick={() => navigate('/financeiro')}
            className={`relative overflow-hidden rounded-2xl p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in border ${
              caixaAberto
                ? 'bg-white border-slate-200/80'
                : 'bg-red-50 border-red-200/80'
            }`}
            style={{ animationDelay: '150ms' }}
          >
            <Wallet className={`absolute -top-1 -right-1 h-14 w-14 ${caixaAberto ? 'text-green-500/10' : 'text-red-500/10'}`} strokeWidth={1.5} />
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${caixaAberto ? 'text-slate-400' : 'text-red-400'}`}>Caixa</p>
            {caixaLoading ? <Skeleton className="h-9 w-20" /> : caixaAberto ? (
              <>
                <MoneyDisplay valor={saldoCaixa} className="text-3xl font-bold text-slate-900" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 mt-1.5">Aberto</span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-red-700">Fechado</span>
                <p className="text-xs text-red-500 font-semibold mt-1.5">Abrir Caixa →</p>
              </>
            )}
            <ArrowUpRight className={`absolute bottom-3 right-3 h-4 w-4 ${caixaAberto ? 'text-slate-300 group-hover:text-slate-500' : 'text-red-300 group-hover:text-red-500'} transition-colors`} />
          </button>
        </div>

        {/* LINHA 3 — 3 blocos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Atalhos Rápidos — FIRST on mobile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm order-1 lg:order-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="font-display font-semibold text-sm text-slate-700 mb-3">Atalhos Rápidos</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {quickActions.map((a) => {
                const isCaixa = a.id === 'caixa';
                return (
                  <button
                    key={a.path}
                    onClick={() => navigate(a.path)}
                    className="relative flex flex-col items-center gap-2 py-3 px-1 rounded-xl hover:bg-slate-50 transition-all group active:scale-95"
                  >
                    <div className={`w-11 h-11 rounded-full ${a.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <a.icon className={`h-5 w-5 ${a.color}`} strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{a.label}</span>
                    {isCaixa && !caixaAberto && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Últimas OS — second on mobile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden order-2 lg:order-2 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="font-display font-semibold text-sm text-slate-700">Últimas OS</h3>
              <button onClick={() => navigate('/os')} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
                Ver todas <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {osLoading ? (
              <div className="px-4 pb-4 space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}
              </div>
            ) : !ultimasOS?.length ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma OS</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {(ultimasOS ?? []).slice(0, 4).map((os) => (
                  <button
                    key={os.id}
                    onClick={() => navigate(`/os/${os.id}`)}
                    className="w-full flex items-center justify-between py-2.5 px-4 hover:bg-slate-50/80 transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">#{os.numero}</span>
                        <StatusBadge status={os.status as StatusOS} />
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate mt-0.5">{os.cliente_nome}</p>
                    </div>
                    {os.valor_total > 0 && <MoneyDisplay valor={os.valor_total} className="text-xs font-semibold text-slate-700 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resumo Rápido — third on mobile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm order-3 lg:order-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="font-display font-semibold text-sm text-slate-700 mb-3">Resumo Rápido</h3>
            <div className="space-y-3">
              <ResumoRow
                icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                label="Ticket Médio"
                value={ticketMedio.isLoading ? '...' : formatarMoeda(ticketMedio.data ?? 0)}
              />
              <ResumoRow
                icon={<AlertTriangle className={`h-4 w-4 ${(pecasAlerta.data ?? 0) > 0 ? 'text-red-500' : 'text-slate-400'}`} />}
                label="Peças em Alerta"
                value={pecasAlerta.isLoading ? '...' : String(pecasAlerta.data ?? 0)}
                valueClass={(pecasAlerta.data ?? 0) > 0 ? 'text-red-600 font-bold' : ''}
                action={(pecasAlerta.data ?? 0) > 0 ? { label: 'Ver peças →', onClick: () => navigate('/pecas') } : undefined}
              />
              <ResumoRow
                icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
                label="Concluídas Hoje"
                value={concluidasHoje.isLoading ? '...' : String(concluidasHoje.data ?? 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ResumoRow({ icon, label, value, valueClass, action }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold text-slate-800 ${valueClass ?? ''}`}>{value}</span>
        {action && (
          <button onClick={action.onClick} className="text-[10px] text-emerald-600 font-semibold hover:underline">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
