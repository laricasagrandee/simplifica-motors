import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatarDataCurta } from '@/lib/formatters';
import { PLANO_LABELS, normalizarPlano } from '@/lib/planos';
import { useNavigate } from 'react-router-dom';
import { useCustomerPortal } from '@/hooks/useStripe';
import { CreditCard, Loader2 } from 'lucide-react';

interface Props {
  plano: string;
  planoAtivo: boolean;
  vencimento?: string | null;
  maxFuncionarios: number;
  funcionariosAtivos: number;
}

export function ConfigPlanoAtual({ plano, planoAtivo, vencimento, maxFuncionarios, funcionariosAtivos }: Props) {
  const navigate = useNavigate();
  const portal = useCustomerPortal();
  const pct = maxFuncionarios > 0 ? (funcionariosAtivos / maxFuncionarios) * 100 : 0;
  const planoNormalizado = normalizarPlano(plano);
  const isTeste = planoNormalizado === 'teste';

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
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/planos')} className="min-h-[44px] flex-1">
            {isTeste ? 'Escolher Plano' : 'Mudar Plano'}
          </Button>
          {!isTeste && (
            <Button
              variant="ghost"
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
              className="min-h-[44px]"
            >
              {portal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
