import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/shared/LoadingState';
import { useMetasMes, useDefinirMeta, useProgressoMetas } from '@/hooks/useMetas';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { cn } from '@/lib/utils';
import { formatarMoeda } from '@/lib/formatters';

interface Props { open: boolean; onClose: () => void; }

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function progressColor(pct: number) {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-destructive';
}

export function MetasDialog({ open, onClose }: Props) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const { data: metas, isLoading: loadMetas } = useMetasMes(mes, ano);
  const { data: progresso } = useProgressoMetas(mes, ano);
  const { data: funcs } = useFuncionarios();
  const definir = useDefinirMeta();

  const mecanicos = useMemo(() => (funcs ?? []).filter(f => f.cargo === 'mecanico' && f.ativo), [funcs]);
  const metasMap = useMemo(() => {
    const m = new Map<string, { meta_os: number; meta_faturamento: number }>();
    (metas ?? []).forEach(meta => m.set(meta.funcionario_id, { meta_os: meta.meta_os, meta_faturamento: meta.meta_faturamento }));
    return m;
  }, [metas]);

  const [edits, setEdits] = useState<Map<string, { meta_os: string; meta_faturamento: string }>>(new Map());

  const getEdit = (id: string) => {
    const saved = metasMap.get(id);
    const edit = edits.get(id);
    return {
      meta_os: edit?.meta_os ?? String(saved?.meta_os ?? 0),
      meta_faturamento: edit?.meta_faturamento ?? String(saved?.meta_faturamento ?? 0),
    };
  };

  const setEdit = (id: string, field: 'meta_os' | 'meta_faturamento', val: string) => {
    setEdits(prev => {
      const next = new Map(prev);
      const cur = getEdit(id);
      next.set(id, { ...cur, [field]: val });
      return next;
    });
  };

  const handleSave = (id: string) => {
    const e = getEdit(id);
    definir.mutate({ funcionario_id: id, mes, ano, meta_os: Number(e.meta_os) || 0, meta_faturamento: Number(e.meta_faturamento) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Metas Mensais</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-2">
          <Select value={String(mes)} onValueChange={v => { setMes(Number(v)); setEdits(new Map()); }}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(ano)} onValueChange={v => { setAno(Number(v)); setEdits(new Map()); }}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>{[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 -mx-6 px-6">
          {loadMetas ? <LoadingState /> : mecanicos.map(mec => {
            const e = getEdit(mec.id);
            const p = progresso?.get(mec.id);
            const pctOS = p && p.meta_os > 0 ? Math.round((p.os_realizadas / p.meta_os) * 100) : 0;
            const pctFat = p && p.meta_faturamento > 0 ? Math.round((p.faturamento_realizado / p.meta_faturamento) * 100) : 0;

            return (
              <div key={mec.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{mec.nome}</span>
                  <Button size="sm" variant="outline" onClick={() => handleSave(mec.id)} disabled={definir.isPending} className="h-7 text-xs">Salvar</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Meta OS</label>
                    <Input type="number" min={0} value={e.meta_os} onChange={ev => setEdit(mec.id, 'meta_os', ev.target.value)} className="h-8" />
                    {p && p.meta_os > 0 && (
                      <div className="space-y-0.5">
                        <Progress value={Math.min(pctOS, 100)} className="h-1.5" />
                        <p className={cn('text-[10px] font-semibold', progressColor(pctOS))}>{p.os_realizadas}/{p.meta_os} ({pctOS}%)</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Meta Faturamento</label>
                    <Input type="number" min={0} step={100} value={e.meta_faturamento} onChange={ev => setEdit(mec.id, 'meta_faturamento', ev.target.value)} className="h-8" />
                    {p && p.meta_faturamento > 0 && (
                      <div className="space-y-0.5">
                        <Progress value={Math.min(pctFat, 100)} className="h-1.5" />
                        <p className={cn('text-[10px] font-semibold', progressColor(pctFat))}>{formatarMoeda(p.faturamento_realizado)}/{formatarMoeda(p.meta_faturamento)} ({pctFat}%)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
