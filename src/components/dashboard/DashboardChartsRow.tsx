import { RevenueChart } from './RevenueChart';
import { StatusDonutChart } from './StatusDonutChart';
import { useFaturamentoSemanal, useOSPorStatus } from '@/hooks/useDashboardCharts';

export function DashboardChartsRow() {
  const faturamento = useFaturamentoSemanal();
  const osPorStatus = useOSPorStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <RevenueChart data={faturamento.data ?? []} loading={faturamento.isLoading} />
      </div>
      <StatusDonutChart data={osPorStatus.data ?? []} loading={osPorStatus.isLoading} />
    </div>
  );
}
