import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState } from '@/components/shared/LoadingState';
import { Play, Pause, Clock, AlertTriangle } from 'lucide-react';
import { useTempoAtivo, useTempoPorOS, useIniciarTempo, usePararTempo } from '@/hooks/useTempoServico';
import { useAuthContext } from '@/components/layout/AuthProvider';
import { format } from 'date-fns';

interface Props {
  osId: string;
  mecanicoId: string | null;
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinutos(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export function OSTempoTab({ osId, mecanicoId }: Props) {
  const { funcionario } = useAuthContext();
  const { data: ativo, isLoading: ativoLoading } = useTempoAtivo(osId);
  const { data: tempoData, isLoading: tempoLoading } = useTempoPorOS(osId);
  const iniciar = useIniciarTempo();
  const parar = usePararTempo();
  const [elapsed, setElapsed] = useState(0);

  const isOutroMecanico = mecanicoId && funcionario?.id && mecanicoId !== funcionario.id;

  useEffect(() => {
    if (!ativo?.inicio) { setElapsed(0); return; }
    const calc = () => Math.floor((Date.now() - new Date(ativo.inicio).getTime()) / 1000);
    setElapsed(calc());
    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [ativo?.inicio]);

  if (ativoLoading || tempoLoading) return <LoadingState variant="card" />;

  const registros = tempoData?.registros.filter(r => r.fim) ?? [];

  return (
    <div className="space-y-6">
      {isOutroMecanico && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning text-sm">Você não é o mecânico desta OS</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="flex flex-col items-center py-8 gap-4">
          <p className="font-mono text-5xl font-bold tracking-wider text-foreground">
            {formatDuration(ativo ? elapsed : 0)}
          </p>
          {ativo ? (
            <Button variant="destructive" size="lg" className="gap-2 animate-pulse"
              onClick={() => parar.mutate({ id: ativo.id, osId, inicio: ativo.inicio })}
              disabled={parar.isPending}>
              <Pause className="h-5 w-5" /> Parar
            </Button>
          ) : (
            <Button size="lg" className="gap-2 bg-success hover:bg-success/90"
              onClick={() => funcionario && iniciar.mutate({ osId, mecanicoId: funcionario.id })}
              disabled={iniciar.isPending || !funcionario}>
              <Play className="h-5 w-5" /> Iniciar
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Tempo Total: {formatMinutos(tempoData?.totalMinutos ?? 0)}</span>
          </div>
          {registros.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum registro.</p>}
          <div className="space-y-1.5">
            {registros.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs border border-border rounded-lg px-3 py-2">
                <span className="text-muted-foreground">{format(new Date(r.inicio), 'dd/MM HH:mm')} — {r.fim ? format(new Date(r.fim), 'HH:mm') : '...'}</span>
                <span className="font-medium text-foreground">{formatMinutos(r.duracao_minutos ?? 0)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
