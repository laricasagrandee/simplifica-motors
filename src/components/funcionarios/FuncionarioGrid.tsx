import type { Funcionario } from '@/types/database';
import { FuncionarioCard } from './FuncionarioCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { UserCog } from 'lucide-react';

interface Props {
  funcionarios: Funcionario[];
  loading: boolean;
  onEditar: (f: Funcionario) => void;
  onToggleAtivo: (id: string, ativo: boolean) => void;
  onNovo?: () => void;
}

export function FuncionarioGrid({ funcionarios, loading, onEditar, onToggleAtivo, onNovo }: Props) {
  if (loading) return <LoadingState />;
  if (!funcionarios.length) {
    return (
      <EmptyState icon={UserCog} titulo="Nenhum funcionário cadastrado"
        descricao="Cadastre sua equipe para gerenciar comissões e produtividade!"
        actionLabel="Novo Funcionário" onAction={onNovo} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {funcionarios.map(f => (
        <FuncionarioCard key={f.id} funcionario={f} onEditar={() => onEditar(f)} onToggleAtivo={() => onToggleAtivo(f.id, !f.ativo)} />
      ))}
    </div>
  );
}
