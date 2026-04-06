import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sanitizeNumeric } from '@/lib/sanitize';
import { Loader2 } from 'lucide-react';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const ufOptions = UFS.map((uf) => ({ value: uf, label: uf }));

interface Props {
  form: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function maskCEP(value: string) {
  const d = sanitizeNumeric(value).slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

export function ClienteFormEndereco({ form, onChange }: Props) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState('');

  const handleCepChange = async (raw: string) => {
    const digits = sanitizeNumeric(raw).slice(0, 8);
    onChange('cep', digits);
    setCepErro('');

    if (digits.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepErro('CEP não encontrado');
        } else {
          onChange('rua', data.logradouro || '');
          onChange('bairro', data.bairro || '');
          onChange('cidade', data.localidade || '');
          onChange('estado', data.uf || '');
        }
      } catch {
        setCepErro('Erro ao buscar CEP');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border">Endereço</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CEP</Label>
          <div className="relative">
            <Input
              value={maskCEP(form.cep)}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={9}
              className="min-h-[44px]"
              placeholder="00000-000"
            />
            {buscandoCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {cepErro && <p className="text-xs text-destructive">{cepErro}</p>}
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rua</Label>
          <Input value={form.rua} onChange={(e) => onChange('rua', e.target.value)} maxLength={200} className="min-h-[44px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Número</Label>
          <Input value={form.numero} onChange={(e) => onChange('numero', e.target.value)} maxLength={20} className="min-h-[44px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bairro</Label>
          <Input value={form.bairro} onChange={(e) => onChange('bairro', e.target.value)} maxLength={200} className="min-h-[44px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cidade</Label>
          <Input value={form.cidade} onChange={(e) => onChange('cidade', e.target.value)} maxLength={200} className="min-h-[44px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">UF</Label>
          <SearchableSelect value={form.estado} onValueChange={(v) => onChange('estado', v)} options={ufOptions} placeholder="UF" />
        </div>
      </div>
    </div>
  );
}
