import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PecaFormFields } from './PecaFormFields';
import { PecaFormPrecos } from './PecaFormPrecos';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Peca } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  peca?: Peca | null;
  onSalvar: (data: Record<string, string | number | null>) => Promise<void>;
  loading: boolean;
}

export function PecaForm({ open, onClose, peca, onSalvar, loading }: Props) {
  const [form, setForm] = useState(getDefaults(peca));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(getDefaults(peca)); setErrors({}); }, [peca, open]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome obrigatório';
    if (!form.categoria) e.categoria = 'Categoria obrigatória';
    const custo = parseFloat(form.preco_custo);
    const venda = parseFloat(form.preco_venda);
    if (isNaN(custo) || custo < 0) e.preco_custo = 'Valor inválido';
    if (isNaN(venda) || venda < 0) e.preco_venda = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSalvar({
      ...(peca ? { id: peca.id } : {}),
      nome: form.nome,
      codigo: form.codigo || null,
      marca: form.marca || null,
      categoria: form.categoria,
      unidade: form.unidade,
      preco_custo: parseFloat(form.preco_custo) || 0,
      preco_venda: parseFloat(form.preco_venda) || 0,
      estoque_atual: parseInt(form.estoque_atual) || 0,
      estoque_minimo: parseInt(form.estoque_minimo) || 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-sm:border-0">
        <DialogHeader>
          <DialogTitle className="font-display">{peca ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PecaFormFields form={form} errors={errors} onChange={set} />
          <PecaFormPrecos form={form} errors={errors} onChange={set} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaults(p?: Peca | null) {
  return {
    nome: p?.nome ?? '', codigo: p?.codigo ?? '', marca: p?.marca ?? '',
    categoria: p?.categoria ?? '', unidade: p?.unidade ?? 'un',
    preco_custo: p?.preco_custo?.toString() ?? '0', preco_venda: p?.preco_venda?.toString() ?? '0',
    estoque_atual: p?.estoque_atual?.toString() ?? '0', estoque_minimo: p?.estoque_minimo?.toString() ?? '0',
  };
}
