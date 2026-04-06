import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { Loader2, Bike, Car } from 'lucide-react';
import { MARCAS_MOTO, MARCAS_CARRO } from '@/lib/constants';
import { validarPlaca } from '@/lib/validators';
import { formatarKm, parsarKm } from '@/lib/formatters';
import type { Veiculo, TipoVeiculo } from '@/types/database';

interface VeiculoFormProps {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  veiculo?: Veiculo | null;
  onSalvar: (data: Record<string, string | number | null> & { clienteId: string; id?: string }) => Promise<void>;
  loading: boolean;
}

const motoOptions = MARCAS_MOTO.map((m) => ({ value: m, label: m }));
const carroOptions = MARCAS_CARRO.map((m) => ({ value: m, label: m }));

export function VeiculoForm({ open, onClose, clienteId, veiculo, onSalvar, loading }: VeiculoFormProps) {
  const [form, setForm] = useState(getDefaults(veiculo));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(getDefaults(veiculo)); setErrors({}); }, [veiculo, open]);

  const set = (f: string, v: string) => {
    setForm((p) => {
      if (f === 'tipo_veiculo' && v !== p.tipo_veiculo) return { ...p, tipo_veiculo: v as TipoVeiculo, marca: '' };
      return { ...p, [f]: v };
    });
  };

  const marcaOpts = form.tipo_veiculo === 'carro' ? carroOptions : motoOptions;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tipo_veiculo) e.tipo_veiculo = 'Tipo obrigatório';
    if (form.placa && !validarPlaca(form.placa)) e.placa = 'Placa inválida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSalvar({
      clienteId,
      ...(veiculo ? { id: veiculo.id } : {}),
      tipo_veiculo: form.tipo_veiculo,
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
          <DialogTitle className="font-display">{veiculo ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TipoToggle value={form.tipo_veiculo as TipoVeiculo} onChange={(v) => set('tipo_veiculo', v)} error={errors.tipo_veiculo} />
          <F label="Marca" error={errors.marca}>
            <SearchableSelect value={form.marca} onValueChange={(v) => set('marca', v)} options={marcaOpts} placeholder="Selecione" />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Modelo" error={errors.modelo}><Input value={form.modelo} onChange={(e) => set('modelo', e.target.value)} maxLength={100} className="min-h-[44px]" /></F>
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

function TipoToggle({ value, onChange, error }: { value: TipoVeiculo; onChange: (v: TipoVeiculo) => void; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo *</Label>
      <div className="flex gap-2">
        {([{ v: 'moto', Icon: Bike }, { v: 'carro', Icon: Car }] as const).map(({ v, Icon }) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
              value === v ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground hover:bg-muted'
            }`}>
            <Icon className="h-4 w-4" /> {v === 'moto' ? 'Moto' : 'Carro'}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
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

function getDefaults(v?: Veiculo | null) {
  return {
    tipo_veiculo: 'moto' as string,
    marca: v?.marca ?? '',
    modelo: v?.modelo ?? '',
    ano: v?.ano?.toString() ?? '',
    cor: v?.cor ?? '',
    placa: v?.placa ?? '',
    km: v?.quilometragem?.toString() ?? '',
  };
}
