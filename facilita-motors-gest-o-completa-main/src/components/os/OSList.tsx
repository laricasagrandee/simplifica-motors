import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ClipboardList } from 'lucide-react';
import { OSListDesktop } from './OSListDesktop';
import { OSListMobile } from './OSListMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import type { OrdemServico } from '@/types/database';

interface Props {
  ordens: OrdemServico[];
  loading: boolean;
  onVer: (id: string) => void;
  onNova?: () => void;
}

export function OSList({ ordens, loading, onVer, onNova }: Props) {
  const isMobile = useIsMobile();

  if (loading) return <LoadingState variant="table" />;
  if (ordens.length === 0) {
    return (
      <EmptyState icon={ClipboardList} titulo="Nenhuma OS encontrada"
        descricao="Abra sua primeira ordem de serviço para começar!"
        actionLabel="Abrir OS" onAction={onNova} />
    );
  }

  if (isMobile) return <OSListMobile ordens={ordens} onVer={onVer} />;
  return <OSListDesktop ordens={ordens} onVer={onVer} />;
}
