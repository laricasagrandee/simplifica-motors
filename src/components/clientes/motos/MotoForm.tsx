import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MARCAS_MOTOS } from '@/lib/constants';
import { validarPlaca } from '@/lib/validators';
import { formatarKm, parsarKm } from '@/lib/formatters';
import type { Moto } from '@/types/database';

interface MotoFormProps {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  moto?: Moto | null;
  onSalvar: (data: Record<string, string | number | null> & { clienteId: string; id?: string }) => Promise<void>;
  loading: boolean;
}

const marcaOptions = MARCAS_MOTOS.map((m) => ({ value: m, label: m }));

export function MotoForm({ open, onClose, clienteId, moto, onSalvar, loading }: MotoFormProps) {
  const [form, setForm] = useState(getDefaults(moto));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(getDefaults(moto)); setErrors({}); }, [moto, open]);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.placa && !validarPlaca(form.placa)) e.placa = 'Placa inválida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSalvar({
      clienteId,
      ...(moto ? { id: moto.id } : {}),
      marca: form.marca,
      modelo: form.modelo,
      ano: form.ano ? Number(form.ano) : null,
      cor: form.cor || null,
      placa: form.placa || null,
      quilometragem: form.km ? Number(parsarKm(form.km)) : null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{moto ? 'Editar Moto' : 'Nova Moto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <F label="Marca">
            <SearchableSelect value={form.marca} onValueChange={(v) => set('marca', v)} options={marcaOptions} placeholder="Selecione" />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Modelo"><Input value={form.modelo} onChange={(e) => set('modelo', e.target.value)} maxLength={100} className="min-h-[44px]" /></F>
            <F label="Ano"><Input type="number" value={form.ano} onChange={(e) => set('ano', e.target.value)} min={1950} max={2030} className="min-h-[44px]" /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Placa" error={errors.placa}><Input value={form.placa} onChange={(e) => set('placa', e.target.value.toUpperCase())} maxLength={8} placeholder="ABC1D23" className="font-mono min-h-[44px]" /></F>
            <F label="Cor"><Input value={form.cor} onChange={(e) => set('cor', e.target.value)} maxLength={50} className="min-h-[44px]" /></F>
          </div>
          <F label="Quilometragem"><Input value={formatarKm(form.km)} onChange={(e) => set('km', parsarKm(e.target.value))} inputMode="numeric" placeholder="Ex: 35.000" className="min-h-[44px]" /></F>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}{required && <span className="text-danger ml-0.5">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function getDefaults(m?: Moto | null) {
  return { marca: m?.marca ?? '', modelo: m?.modelo ?? '', ano: m?.ano?.toString() ?? '', cor: m?.cor ?? '', placa: m?.placa ?? '', km: m?.quilometragem?.toString() ?? '' };
}
