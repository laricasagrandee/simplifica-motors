import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminEditarOficina, PLANOS_CONFIG } from '@/hooks/useAdminOficinas';
import { formatarMoeda } from '@/lib/formatters';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';

interface Props {
  oficina: OficinaComStatus;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PLANOS_PAGOS = ['basico', 'profissional', 'premium', 'enterprise'] as const;

function defaultVencimento() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function AtivarPlanoDialog({ oficina, open, onOpenChange }: Props) {
  const [plano, setPlano] = useState('basico');
  const [vencimento, setVencimento] = useState(defaultVencimento());
  const editar = useAdminEditarOficina();

  const cfg = PLANOS_CONFIG[plano];

  const handleAtivar = () => {
    editar.mutate({
      id: oficina.id,
      plano,
      plano_ativo: true,
      data_vencimento_plano: new Date(vencimento + 'T12:00:00').toISOString(),
      max_funcionarios: cfg.maxFunc,
      dias_tolerancia: 15,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Ativar Plano — {oficina.nome_fantasia}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Plano</Label>
            <Select value={plano} onValueChange={setPlano}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANOS_PAGOS.map((key) => {
                  const c = PLANOS_CONFIG[key];
                  return (
                    <SelectItem key={key} value={key}>
                      {c.label} — {formatarMoeda(c.preco)}/mês
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Vencimento</Label>
            <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Máx. funcionários:</span>
              <span className="text-white font-medium">{cfg.maxFunc === 999 ? 'Ilimitado' : cfg.maxFunc}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Valor:</span>
              <span className="text-white font-medium">{formatarMoeda(cfg.preco)}/mês</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button onClick={handleAtivar} disabled={editar.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Ativar Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
