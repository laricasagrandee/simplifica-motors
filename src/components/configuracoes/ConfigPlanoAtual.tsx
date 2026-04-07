import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatarDataCurta } from '@/lib/formatters';
import { PLANO_LABELS, normalizarPlano } from '@/lib/planos';
import { useNavigate } from 'react-router-dom';

interface Props {
  plano: string;
  planoAtivo: boolean;
  vencimento?: string | null;
  maxFuncionarios: number;
  funcionariosAtivos: number;
}

export function ConfigPlanoAtual({ plano, planoAtivo, vencimento, maxFuncionarios, funcionariosAtivos }: Props) {
  const navigate = useNavigate();
  const pct = maxFuncionarios > 0 ? (funcionariosAtivos / maxFuncionarios) * 100 : 0;
  const planoNormalizado = normalizarPlano(plano);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Plano Atual</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">{PLANO_LABELS[planoNormalizado]}</span>
          <Badge className={planoAtivo ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}>
            {planoAtivo ? 'Ativo' : 'Bloqueado'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Funcionários: {funcionariosAtivos} / {maxFuncionarios}</p>
          <Progress value={pct} className="h-2" />
        </div>
        {vencimento && <p className="text-xs text-muted-foreground">Vencimento: {formatarDataCurta(vencimento)}</p>}
        <Button variant="outline" onClick={() => navigate('/planos')} className="min-h-[44px]">Mudar Plano</Button>
      </CardContent>
    </Card>
  );
}
