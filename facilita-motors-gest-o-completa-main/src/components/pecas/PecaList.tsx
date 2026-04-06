import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Package } from 'lucide-react';
import { PecaListDesktop } from './PecaListDesktop';
import { PecaListMobile } from './PecaListMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Peca } from '@/types/database';

interface PecaListProps {
  pecas: Peca[];
  loading: boolean;
  onEditar: (p: Peca) => void;
  onVer: (id: string) => void;
  onNova?: () => void;
}

export function PecaList({ pecas, loading, onEditar, onVer, onNova }: PecaListProps) {
  const isMobile = useIsMobile();

  if (loading) return <LoadingState variant="table" />;
  if (pecas.length === 0) {
    return (
      <EmptyState icon={Package} titulo="Nenhuma peça cadastrada"
        descricao="Monte seu catálogo de peças e produtos!"
        actionLabel="Cadastrar Peça" onAction={onNova} />
    );
  }

  if (isMobile) return <PecaListMobile pecas={pecas} onVer={onVer} />;
  return <PecaListDesktop pecas={pecas} onEditar={onEditar} onVer={onVer} />;
}
