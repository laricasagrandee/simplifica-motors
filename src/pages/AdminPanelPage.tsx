import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MASTER_EMAIL } from '@/lib/constants';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminResumoCards } from '@/components/admin/AdminResumoCards';
import { OficinasTable } from '@/components/admin/OficinasTable';
import { useAdminOficinas, useFuncionariosCount } from '@/hooks/useAdminOficinas';
import { Loader2 } from 'lucide-react';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== MASTER_EMAIL) {
        navigate('/dashboard', { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  const { data: oficinas, isLoading } = useAdminOficinas();
  const { data: totalFuncionarios } = useFuncionariosCount();

  if (checking) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <AdminResumoCards oficinas={oficinas || []} />
            <OficinasTable oficinas={oficinas || []} totalFuncionarios={totalFuncionarios || 0} />
          </>
        )}
      </main>
    </div>
  );
}
