interface Props { total: number; mecanicos: number; ativos: number; }

export function FuncionarioResumo({ total, mecanicos, ativos }: Props) {
  return (
    <p className="text-sm text-muted-foreground mb-4">
      {total} funcionários · {mecanicos} mecânicos · {ativos} ativos
    </p>
  );
}
