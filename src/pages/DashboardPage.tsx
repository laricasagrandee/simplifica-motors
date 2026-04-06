import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { DashboardMetricsRow } from '@/components/dashboard/DashboardMetricsRow';
import { DashboardChartsRow } from '@/components/dashboard/DashboardChartsRow';
import { DashboardBottomRow } from '@/components/dashboard/DashboardBottomRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header: greeting + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DashboardGreeting />
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => navigate('/os/rapida')}
              className="gap-2 bg-success text-success-foreground hover:bg-success/90 min-h-[44px] px-5 text-sm font-semibold shadow-md"
            >
              <Zap className="h-4 w-4" /> Abrir OS Rápida
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/os/nova')}
              className="gap-2 min-h-[44px] px-5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Nova OS Completa
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <DashboardMetricsRow />

        {/* Charts */}
        <DashboardChartsRow />

        {/* Bottom: recent OS, alerts, ranking */}
        <DashboardBottomRow />

        {/* Quick actions grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Acesso Rápido
          </h2>
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  );
}
