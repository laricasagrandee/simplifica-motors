import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { PlanosComparativo } from '@/components/planos/PlanosComparativo';
import { PlanosFAQ } from '@/components/planos/PlanosFAQ';
import { usePlanoAtual, useTrocarPlano } from '@/hooks/usePlanos';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

export default function PlanosPage() {
  const plano = usePlanoAtual();
  const config = useConfiguracoes();
  const trocar = useTrocarPlano();

  return (
    <AppLayout>
      <PageHeader titulo="Planos" subtitulo="Escolha o melhor plano para sua oficina" />
      <PlanosComparativo planoAtual={plano.data?.plano || 'basico'}
        onAssinar={p => config.data && trocar.mutate({ plano: p, configId: config.data.id })} />
      <PlanosFAQ />
    </AppLayout>
  );
}
