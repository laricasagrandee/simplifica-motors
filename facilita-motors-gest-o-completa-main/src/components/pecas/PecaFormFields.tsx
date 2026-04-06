import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CATEGORIAS_PECAS } from '@/lib/constants';

interface Props {
  form: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const UNIDADES = ['un', 'litro', 'metro', 'kit'];
const categoriaOptions = Object.entries(CATEGORIAS_PECAS).map(([k, v]) => ({ value: k, label: v }));
const unidadeOptions = UNIDADES.map((u) => ({ value: u, label: u }));

export function PecaFormFields({ form, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <F label="Nome" required error={errors.nome}>
          <Input value={form.nome} onChange={(e) => onChange('nome', e.target.value)} maxLength={200} className="min-h-[44px]" />
        </F>
        <F label="Código">
          <Input value={form.codigo} onChange={(e) => onChange('codigo', e.target.value)} maxLength={50} className="font-mono min-h-[44px]" />
        </F>
        <F label="Marca">
          <Input value={form.marca} onChange={(e) => onChange('marca', e.target.value)} maxLength={100} className="min-h-[44px]" />
        </F>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Categoria" required error={errors.categoria}>
          <SearchableSelect value={form.categoria} onValueChange={(v) => onChange('categoria', v)} options={categoriaOptions} placeholder="Selecione" />
        </F>
        <F label="Unidade">
          <SearchableSelect value={form.unidade} onValueChange={(v) => onChange('unidade', v)} options={unidadeOptions} placeholder="Selecione" />
        </F>
      </div>
    </div>
  );
}

function F({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
