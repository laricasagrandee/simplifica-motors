import { useAuthContext } from '@/components/layout/AuthProvider';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardGreeting() {
  const { funcionario } = useAuthContext();
  const nome = funcionario?.nome?.split(' ')[0] ?? 'Admin';

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground">
        {getGreeting()}, <span className="text-primary">{nome}</span> 👋
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">Aqui está o resumo da sua oficina hoje.</p>
    </div>
  );
}
