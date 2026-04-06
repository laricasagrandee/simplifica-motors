import { useAuthContext } from '@/components/layout/AuthProvider';
import { useLogout } from '@/hooks/useAuth';
import { CARGOS } from '@/lib/constants';
import { LogOut } from 'lucide-react';

export function SidebarUserFooter() {
  const { funcionario, usuario } = useAuthContext();
  const { logout } = useLogout();

  const nome = funcionario?.nome ?? usuario?.email?.split('@')[0] ?? 'Usuário';
  const iniciais = nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const cargo = funcionario?.cargo ? CARGOS[funcionario.cargo] : 'Sem cargo';

  return (
    <div className="px-3 pb-4">
      <div className="bg-surface-secondary rounded-lg p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent-light text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{nome}</p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cargo}</span>
        </div>
        <button
          onClick={() => logout()}
          className="text-muted-foreground hover:text-danger transition-colors shrink-0"
          title="Sair"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
