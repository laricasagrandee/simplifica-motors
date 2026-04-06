import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { AgendamentoCalendario } from '@/components/agendamentos/AgendamentoCalendario';

export default function AgendamentosPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader titulo="Agendamentos" subtitulo="Gerencie os agendamentos de serviços da oficina" />
        <AgendamentoCalendario />
      </div>
    </AppLayout>
  );
}
