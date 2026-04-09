import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { InstallPWABanner } from '@/components/shared/InstallPWABanner';
import { useAuthContext } from './AuthProvider';
import AguardandoAprovacaoPage from '@/pages/AguardandoAprovacaoPage';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { funcionario, funcionarioLoading } = useAuthContext();

  if (funcionarioLoading) return null;

  if (!funcionario) {
    return <AguardandoAprovacaoPage />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <InstallPWABanner />
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
