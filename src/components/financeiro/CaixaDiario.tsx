import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatarDataCurta, formatarMoeda } from '@/lib/formatters';
import { Lock, Unlock, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Caixa } from '@/types/database';

interface Props {
  caixa: Caixa | null;
  loading: boolean;
  historico: Caixa[];
  onAbrir: (valor: number) => void;
  onFechar: (id: string) => void;
}

function OSPagasHoje() {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const { data: osPagas } = useQuery({
    queryKey: ['os-pagas-hoje', hoje],
    queryFn: async () => {
      const { data } = await supabase.from('movimentacoes')
        .select('descricao, valor, forma_pagamento, data')
        .eq('categoria', 'os_pagamento')
        .gte('data', `${hoje}T00:00:00`).lte('data', `${hoje}T23:59:59`)
        .order('data', { ascending: false }).limit(10);
      return data || [];
    },
  });
  if (!osPagas?.length) return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
        <ClipboardList className="h-4 w-4" /> Pagamentos de OS Hoje
      </CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma movimentação hoje. Quando registrar pagamentos, eles vão aparecer aqui.
        </p>
      </CardContent>
    </Card>
  );
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
        <ClipboardList className="h-4 w-4" /> Pagamentos de OS Hoje
      </CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {osPagas.map((m, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-2 text-sm">
              <span className="font-medium truncate flex-1">{m.descricao}</span>
              <Badge variant="outline" className="text-xs mx-2">{m.forma_pagamento}</Badge>
              <MoneyDisplay valor={m.valor} className="text-success font-semibold" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                {m.data ? format(new Date(m.data), 'HH:mm') : ''}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CaixaDiario({ caixa, loading, historico, onAbrir, onFechar }: Props) {
  const [saldoAbertura, setSaldoAbertura] = useState('');
  const [confirmFechar, setConfirmFechar] = useState(false);

  const hoje = format(new Date(), 'yyyy-MM-dd');
  const { data: resumoFechamento } = useQuery({
    queryKey: ['resumo-fechamento', hoje],
    queryFn: async () => {
      const { data: movs } = await supabase
        .from('movimentacoes')
        .select('tipo, valor')
        .eq('pago', true)
        .gte('data', `${hoje}T00:00:00`)
        .lte('data', `${hoje}T23:59:59`);
      const entradas = (movs || []).filter(m => m.tipo === 'entrada').reduce((s, m) => s + Number(m.valor), 0);
      const saidas = (movs || []).filter(m => m.tipo === 'saida').reduce((s, m) => s + Number(m.valor), 0);
      return { entradas, saidas };
    },
    enabled: !!caixa && caixa.status === 'aberto',
  });

  if (loading) return <Skeleton className="h-40 w-full" />;

  const saldoAbert = caixa?.saldo_abertura ?? 0;
  const entradasCalc = resumoFechamento?.entradas ?? (caixa?.total_entradas ?? 0);
  const saidasCalc = resumoFechamento?.saidas ?? (caixa?.total_saidas ?? 0);
  const saldoFinalCalc = saldoAbert + entradasCalc - saidasCalc;

  if (!caixa) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Unlock className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Caixa não aberto hoje</p>
          <div className="flex gap-2 justify-center items-end max-w-xs mx-auto">
            <div className="flex-1">
              <Input type="number" step="0.01" placeholder="Saldo de abertura" value={saldoAbertura}
                onChange={e => setSaldoAbertura(e.target.value)} className="min-h-[44px] font-mono" />
            </div>
            <Button onClick={() => { onAbrir(parseFloat(saldoAbertura) || 0); setSaldoAbertura(''); }}
              className="min-h-[44px] bg-accent text-accent-foreground">Abrir Caixa</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Caixa de Hoje</CardTitle>
          <Badge className={caixa.status === 'aberto' ? 'bg-success-light text-success' : 'bg-muted text-muted-foreground'}>
            {caixa.status === 'aberto' ? 'Aberto' : 'Fechado'}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-muted-foreground">Abertura</p><MoneyDisplay valor={saldoAbert} /></div>
          <div><p className="text-xs text-muted-foreground">Entradas</p><MoneyDisplay valor={entradasCalc} className="text-success" /></div>
          <div><p className="text-xs text-muted-foreground">Saídas</p><MoneyDisplay valor={saidasCalc} className="text-destructive" /></div>
          <div><p className="text-xs text-muted-foreground">Saldo</p><MoneyDisplay valor={saldoFinalCalc} className={saldoFinalCalc >= 0 ? 'text-accent' : 'text-destructive'} /></div>
        </CardContent>
        {caixa.status === 'aberto' ? (
          <div className="px-6 pb-4">
            <Button variant="outline" className="w-full min-h-[44px] border-destructive text-destructive" onClick={() => setConfirmFechar(true)}>Fechar Caixa</Button>
          </div>
        ) : (
          <div className="px-6 pb-4 space-y-3">
            <div className="bg-warning-light border border-warning-border rounded-lg p-4 text-center space-y-1">
              <p className="text-sm font-semibold text-warning">Caixa fechado</p>
              <p className="text-xs text-muted-foreground">Fechou sem querer? Reabra o caixa do dia.</p>
            </div>
            <div className="flex gap-2 justify-center items-end max-w-xs mx-auto">
              <div className="flex-1">
                <Input type="number" step="0.01" placeholder="Saldo de abertura" value={saldoAbertura}
                  onChange={e => setSaldoAbertura(e.target.value)} className="min-h-[44px] font-mono" />
              </div>
              <Button onClick={() => { onAbrir(parseFloat(saldoAbertura) || 0); setSaldoAbertura(''); }}
                className="min-h-[44px] bg-accent text-accent-foreground gap-2 font-semibold">
                <Unlock className="h-5 w-5" /> Reabrir Caixa
              </Button>
            </div>
          </div>
        )}
      </Card>

      <OSPagasHoje />

      {/* Fechamento summary dialog */}
      <ConfirmDialog open={confirmFechar} titulo="Fechar Caixa?"
        descricao=""
        onConfirm={() => { onFechar(caixa.id); setConfirmFechar(false); }} onOpenChange={setConfirmFechar}
        customContent={
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Resumo do dia antes de fechar:</p>
            <div className="bg-surface-secondary rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo de abertura</span>
                <span className="font-mono font-medium">{formatarMoeda(saldoAbert)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total entradas</span>
                <span className="font-mono font-medium text-success">+{formatarMoeda(entradasCalc)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total saídas</span>
                <span className="font-mono font-medium text-destructive">-{formatarMoeda(saidasCalc)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold">Saldo final</span>
                <span className={`font-mono font-bold ${saldoFinalCalc >= 0 ? 'text-accent' : 'text-destructive'}`}>{formatarMoeda(saldoFinalCalc)}</span>
              </div>
            </div>
          </div>
        }
      />

      {historico.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Últimos 7 dias</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {historico.map(c => (
                <div key={c.id} className="flex justify-between items-center px-4 py-2 text-sm">
                  <span className="font-mono text-xs">{formatarDataCurta(c.data)}</span>
                  <Badge variant="outline" className="text-xs">{c.status === 'aberto' ? 'Aberto' : 'Fechado'}</Badge>
                  <MoneyDisplay valor={c.saldo_fechamento ?? 0} className={(c.saldo_fechamento ?? 0) >= 0 ? 'text-success' : 'text-destructive'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
