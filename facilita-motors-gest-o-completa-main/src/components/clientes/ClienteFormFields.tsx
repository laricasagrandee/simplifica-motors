import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import { validarCPF, validarCNPJ } from '@/lib/validators';
import { sanitizeNumeric } from '@/lib/sanitize';

interface Props {
  form: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function maskDoc(value: string) {
  const digits = sanitizeNumeric(value).slice(0, 14);
  if (digits.length <= 11) return formatarCPF(digits);
  return formatarCNPJ(digits);
}

function maskTel(value: string) {
  const digits = sanitizeNumeric(value).slice(0, 11);
  if (digits.length === 0) return '';
  return formatarTelefone(digits);
}

export function ClienteFormFields({ form, errors, onChange }: Props) {
  const [docErro, setDocErro] = useState('');

  const handleDocBlur = () => {
    const digits = sanitizeNumeric(form.cpf_cnpj);
    if (!digits) { setDocErro(''); return; }
    if (digits.length <= 11) {
      if (digits.length === 11 && !validarCPF(digits)) {
        setDocErro('CPF inválido');
        return;
      }
      if (digits.length > 0 && digits.length < 11) {
        setDocErro('CPF incompleto');
        return;
      }
    } else {
      if (digits.length === 14 && !validarCNPJ(digits)) {
        setDocErro('CNPJ inválido');
        return;
      }
      if (digits.length < 14) {
        setDocErro('CNPJ incompleto');
        return;
      }
    }
    setDocErro('');
  };

  const docError = errors.cpf_cnpj || docErro;

  return (
    <div className="space-y-4">
      <Field label="Nome" required error={errors.nome}>
        <Input value={form.nome} onChange={(e) => onChange('nome', e.target.value)} maxLength={200} className="min-h-[44px]" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="CPF / CNPJ" error={docError}>
          <Input
            value={maskDoc(form.cpf_cnpj)}
            onChange={(e) => { onChange('cpf_cnpj', sanitizeNumeric(e.target.value)); setDocErro(''); }}
            onBlur={handleDocBlur}
            maxLength={18}
            className="font-mono min-h-[44px]"
            placeholder="000.000.000-00"
          />
        </Field>
        <Field label="Telefone" error={errors.telefone}>
          <Input
            value={maskTel(form.telefone)}
            onChange={(e) => onChange('telefone', sanitizeNumeric(e.target.value))}
            maxLength={15}
            className="min-h-[44px]"
            placeholder="(00) 00000-0000"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="E-mail">
          <Input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} maxLength={200} className="min-h-[44px]" />
        </Field>
        <Field label="Data de Nascimento">
          <Input type="date" value={form.data_nascimento ?? ''} onChange={(e) => onChange('data_nascimento', e.target.value)} className="min-h-[44px]" />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
