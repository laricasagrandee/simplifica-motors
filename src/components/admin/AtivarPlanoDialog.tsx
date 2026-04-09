import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminEditarOficina } from '@/hooks/useAdminOficinas';
import { calcularProximoVencimento } from '@/modules/license/api/licenseApi';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';

interface Props {
  oficina: OficinaComStatus;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function defaultVencimento(dataAnterior: string | null) {
  return calcularProximoVencimento(dataAnterior, 30).slice(0, 10);
}

export function AtivarPlanoDialog({ oficina, open, onOpenChange }: Props) {
  const [vencimento, setVencimento] = useState(defaultVencimento(oficina.data_vencimento_plano ?? null));
  const editar = useAdminEditarOficina();

  const handleAtivar = () => {
    editar.mutate({
      id: oficina.id,
      plano_ativo: true,
      data_vencimento_plano: new Date(vencimento + 'T12:00:00').toISOString(),
      dias_tolerancia: 15,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Renovar — {oficina.nome_fantasia}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Novo vencimento</Label>
            <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
            <p className="text-xs text-slate-500 mt-1">O acesso será liberado e o vencimento atualizado.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button onClick={handleAtivar} disabled={editar.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Renovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
