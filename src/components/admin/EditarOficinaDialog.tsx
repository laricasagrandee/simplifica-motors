import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminEditarOficina } from '@/hooks/useAdminOficinas';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';

interface Props {
  oficina: OficinaComStatus;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PLANOS = ['basico', 'profissional', 'premium', 'vitalicia', 'enterprise'];

export function EditarOficinaDialog({ oficina, open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    nome_fantasia: oficina.nome_fantasia || '',
    cnpj: oficina.cnpj || '',
    plano: oficina.plano || 'basico',
    data_vencimento_plano: oficina.data_vencimento_plano?.slice(0, 10) || '',
    plano_ativo: oficina.plano_ativo ?? true,
    max_funcionarios: oficina.max_funcionarios || 3,
    dias_tolerancia: oficina.dias_tolerancia || 15,
  });

  const editar = useAdminEditarOficina();

  const handleSave = () => {
    editar.mutate({
      id: oficina.id,
      nome_fantasia: form.nome_fantasia,
      cnpj: form.cnpj || null,
      plano: form.plano,
      data_vencimento_plano: form.data_vencimento_plano ? new Date(form.data_vencimento_plano + 'T12:00:00').toISOString() : null,
      plano_ativo: form.plano_ativo,
      max_funcionarios: form.max_funcionarios,
      dias_tolerancia: form.dias_tolerancia,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Oficina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Nome Fantasia</Label>
            <Input value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">CNPJ</Label>
            <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">Plano</Label>
            <Select value={form.plano} onValueChange={(v) => setForm({ ...form, plano: v })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANOS.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Vencimento</Label>
            <Input type="date" value={form.data_vencimento_plano} onChange={(e) => setForm({ ...form, data_vencimento_plano: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">Plano Ativo</Label>
            <Switch checked={form.plano_ativo} onCheckedChange={(v) => setForm({ ...form, plano_ativo: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">Máx. Funcionários</Label>
              <Input type="number" min={1} value={form.max_funcionarios} onChange={(e) => setForm({ ...form, max_funcionarios: Number(e.target.value) })} className="bg-slate-700 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Dias Tolerância</Label>
              <Input type="number" min={0} value={form.dias_tolerancia} onChange={(e) => setForm({ ...form, dias_tolerancia: Number(e.target.value) })} className="bg-slate-700 border-slate-600 text-white" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button onClick={handleSave} disabled={editar.isPending || !form.nome_fantasia}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
