import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { PlanosComparativo } from '@/components/planos/PlanosComparativo';
import { PlanosFAQ } from '@/components/planos/PlanosFAQ';
import { usePlanoAtual } from '@/hooks/usePlanos';
import { normalizarPlano } from '@/lib/planos';

export default function PlanosPage() {
  const plano = usePlanoAtual();

  return (
    <AppLayout>
      <PageHeader titulo="Plano" subtitulo="Gerencie sua assinatura" />
      <PlanosComparativo planoAtual={normalizarPlano(plano.data?.plano)} />
      <PlanosFAQ />
    </AppLayout>
  );
}
