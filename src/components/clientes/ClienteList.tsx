import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';
import { ClienteListDesktop } from './ClienteListDesktop';
import { ClienteListMobile } from './ClienteListMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Cliente } from '@/types/database';

interface ClienteListProps {
  clientes: (Cliente & { motos_count: number })[];
  loading: boolean;
  onEditar: (c: Cliente) => void;
  onVer: (id: string) => void;
  onExcluir: (c: Cliente) => void;
  onNovo?: () => void;
}

export function ClienteList({ clientes, loading, onEditar, onVer, onExcluir, onNovo }: ClienteListProps) {
  const isMobile = useIsMobile();

  if (loading) return <LoadingState variant="table" />;

  if (clientes.length === 0) {
    return (
      <EmptyState icon={Users} titulo="Nenhum cliente cadastrado"
        descricao="Cadastre seu primeiro cliente para começar a gerenciar sua oficina!"
        actionLabel="Cadastrar Cliente" onAction={onNovo} />
    );
  }

  if (isMobile) return <ClienteListMobile clientes={clientes} onEditar={onEditar} onVer={onVer} onExcluir={onExcluir} />;
  return <ClienteListDesktop clientes={clientes} onEditar={onEditar} onVer={onVer} onExcluir={onExcluir} />;
}
