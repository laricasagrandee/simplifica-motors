import { RecentOS } from './RecentOS';
import { AlertsList } from './AlertsList';
import { MecanicoRanking } from './MecanicoRanking';
import { QuickActions } from './QuickActions';
import { useUltimasOS } from '@/hooks/useDashboardOS';
import { useAlertasDashboard } from '@/hooks/useDashboardAlertas';
import { useRankingMecanicos } from '@/hooks/useDashboardRanking';

export function DashboardBottomRow() {
  const ultimasOS = useUltimasOS();
  const alertas = useAlertasDashboard();
  const ranking = useRankingMecanicos();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOS data={ultimasOS.data ?? []} loading={ultimasOS.isLoading} />
        <AlertsList data={alertas.data ?? []} loading={alertas.isLoading} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MecanicoRanking data={ranking.data ?? []} loading={ranking.isLoading} />
        <QuickActions />
      </div>
    </>
  );
}
