import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Props {
  form: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function calcMargem(custo: string, venda: string) {
  const c = parseFloat(custo) || 0;
  const v = parseFloat(venda) || 0;
  if (v <= 0 || c <= 0) return null;
  return ((v - c) / v) * 100;
}

function margemBadge(margem: number | null) {
  if (margem === null) return null;
  const pct = margem.toFixed(1) + '%';
  if (margem >= 30) return <Badge className="bg-success-light text-success border-success-border text-xs">{pct} margem</Badge>;
  if (margem >= 15) return <Badge className="bg-warning-light text-warning border-warning-border text-xs">{pct} margem</Badge>;
  return <Badge className="bg-danger-light text-danger border-danger-border text-xs">{pct} margem</Badge>;
}

export function PecaFormPrecos({ form, errors, onChange }: Props) {
  const margem = calcMargem(form.preco_custo, form.preco_venda);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Preço Custo (R$)" error={errors.preco_custo}>
          <Input type="number" step="0.01" min="0" value={form.preco_custo} onChange={(e) => onChange('preco_custo', e.target.value)} className="min-h-[44px]" />
        </F>
        <F label="Preço Venda (R$)" error={errors.preco_venda}>
          <Input type="number" step="0.01" min="0" value={form.preco_venda} onChange={(e) => onChange('preco_venda', e.target.value)} className="min-h-[44px]" />
        </F>
      </div>
      {margem !== null && <div className="flex justify-center">{margemBadge(margem)}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Estoque Atual">
          <Input type="number" min="0" value={form.estoque_atual} onChange={(e) => onChange('estoque_atual', e.target.value)} className="min-h-[44px]" />
        </F>
        <F label="Estoque Mínimo">
          <Input type="number" min="0" value={form.estoque_minimo} onChange={(e) => onChange('estoque_minimo', e.target.value)} className="min-h-[44px]" />
        </F>
      </div>
    </div>
  );
}

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
