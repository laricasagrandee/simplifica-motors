import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClienteFormFields } from './ClienteFormFields';
import { ClienteFormEndereco } from './ClienteFormEndereco';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCriarCliente, useEditarCliente } from '@/hooks/useClientes';
import type { Cliente } from '@/types/database';

interface ClienteModalProps {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
}

export function ClienteModal({ open, onClose, cliente }: ClienteModalProps) {
  const [form, setForm] = useState(getDefaults(cliente));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const criar = useCriarCliente();
  const editar = useEditarCliente();
  const loading = criar.isPending || editar.isPending;

  useEffect(() => {
    setForm(getDefaults(cliente));
    setErrors({});
  }, [cliente, open]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome obrigatório';
    if (!form.cpf_cnpj.trim()) e.cpf_cnpj = 'CPF/CNPJ obrigatório';
    if (!form.telefone.trim()) e.telefone = 'Telefone obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (cliente) {
        await editar.mutateAsync({ id: cliente.id, ...form });
        toast.success('Cliente atualizado!');
      } else {
        await criar.mutateAsync(form);
        toast.success('Cliente cadastrado!');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar cliente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-lg max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-sm:border-0">
        <DialogHeader>
          <DialogTitle className="font-display">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClienteFormFields form={form} errors={errors} onChange={set} />
          <ClienteFormEndereco form={form} onChange={set} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
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
    nome: c?.nome ?? '', cpf_cnpj: c?.cpf_cnpj ?? '', telefone: c?.telefone ?? '',
    email: c?.email ?? '', cep: c?.endereco_cep ?? '', rua: c?.endereco_rua ?? '',
    numero: c?.endereco_numero ?? '', bairro: c?.endereco_bairro ?? '', cidade: c?.endereco_cidade ?? '',
    estado: c?.endereco_estado ?? '',
  };
}
