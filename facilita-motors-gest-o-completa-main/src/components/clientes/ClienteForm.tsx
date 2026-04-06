import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClienteFormFields } from './ClienteFormFields';
import { ClienteFormEndereco } from './ClienteFormEndereco';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Cliente } from '@/types/database';

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
  onSalvar: (data: Record<string, string | null>) => Promise<void>;
  loading: boolean;
}

export function ClienteForm({ open, onClose, cliente, onSalvar, loading }: ClienteFormProps) {
  const [form, setForm] = useState(getDefaults(cliente));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(getDefaults(cliente)); setErrors({}); }, [cliente, open]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSalvar(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClienteFormFields form={form} errors={errors} onChange={set} />
          <ClienteFormEndereco form={form} onChange={set} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaults(c?: Cliente | null) {
  return {
    nome: c?.nome ?? '',
    cpf_cnpj: c?.cpf_cnpj ?? '',
    telefone: c?.telefone ?? '',
    email: c?.email ?? '',
    data_nascimento: c?.data_nascimento ?? '',
    cep: c?.endereco_cep ?? '',
    rua: c?.endereco_rua ?? '',
    numero: c?.endereco_numero ?? '',
    bairro: c?.endereco_bairro ?? '',
    cidade: c?.endereco_cidade ?? '',
    estado: c?.endereco_estado ?? '',
  };
}
