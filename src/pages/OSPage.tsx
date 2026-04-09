import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { OSContadores } from '@/components/os/OSContadores';
import { OSFiltros as OSFiltrosComponent } from '@/components/os/OSFiltros';
import { OSList } from '@/components/os/OSList';
import { ClientePagination } from '@/components/clientes/ClientePagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useListarOS, useContadoresOS } from '@/hooks/useOS';
import type { OSFiltros } from '@/hooks/useOS';

export default function OSPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<OSFiltros>({ pagina: 1 });

  const { data, isLoading } = useListarOS(filtros);
  const { data: contadores, isLoading: contLoading } = useContadoresOS();

  const updateFiltros = (f: Partial<OSFiltros>) => setFiltros((p) => ({ ...p, ...f }));

  return (
    <AppLayout>
      <PageHeader titulo="Ordens de Serviço" subtitulo="Gerencie todas as OS da oficina">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/os/rapida')} className="gap-2 min-h-[44px]">
            ⚡ OS Rápida
          </Button>
          <Button onClick={() => navigate('/os/nova')} className="gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" /> Nova OS
          </Button>
        </div>
      </PageHeader>
      <OSContadores contadores={contadores} loading={contLoading} statusFiltro={filtros.status} onStatusClick={(s) => updateFiltros({ status: s, pagina: 1 })} />
      <OSFiltrosComponent filtros={filtros} onFiltrosChange={updateFiltros} />
      <OSList ordens={data?.data ?? []} loading={isLoading} onVer={(id) => navigate(`/os/${id}`)} onNova={() => navigate('/os/nova')} />
      <ClientePagination pagina={filtros.pagina ?? 1} total={data?.total ?? 0} porPagina={15} onChange={(p) => updateFiltros({ pagina: p })} />
    </AppLayout>
  );
}
