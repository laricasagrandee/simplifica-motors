import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <DashboardGreeting />
        <QuickActions />
      </div>
    </AppLayout>
  );
}
