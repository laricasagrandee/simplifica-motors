import { ClipboardList, CheckCheck, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { useOSAbertas, useOSConcluidasHoje, useFaturamentoHoje } from '@/hooks/useDashboardMetrics';
import { usePecasAlerta, useTicketMedio } from '@/hooks/useDashboardExtras';

export function DashboardMetricsRow() {
  const osAbertas = useOSAbertas();
  const osConcluidas = useOSConcluidasHoje();
  const faturamento = useFaturamentoHoje();
  const pecasAlerta = usePecasAlerta();
  const ticketMedio = useTicketMedio();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard titulo="OS Abertas" valor={osAbertas.data ?? 0} icone={ClipboardList} cor="text-info" loading={osAbertas.isLoading} />
      <StatCard titulo="Concluídas Hoje" valor={osConcluidas.data ?? 0} icone={CheckCheck} cor="text-success" loading={osConcluidas.isLoading} />
      <StatCard titulo="Faturamento Hoje" valor={faturamento.data ?? 0} icone={DollarSign} cor="text-primary" loading={faturamento.isLoading} isMoney />
      <StatCard titulo="Peças em Alerta" valor={pecasAlerta.data ?? 0} icone={AlertTriangle} cor="text-warning" loading={pecasAlerta.isLoading} />
      <StatCard titulo="Ticket Médio" valor={ticketMedio.data ?? 0} icone={TrendingUp} cor="text-purple" loading={ticketMedio.isLoading} isMoney />
    </div>
  );
}
