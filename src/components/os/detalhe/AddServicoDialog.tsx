import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdicionar: (data: { descricao: string; valorUnitario: number }) => Promise<void>;
  loading: boolean;
}

const SUGESTOES = ['Troca de Óleo', 'Alinhamento', 'Balanceamento', 'Revisão Completa', 'Troca de Pastilha', 'Troca de Correia'];

export function AddServicoDialog({ open, onClose, onAdicionar, loading }: Props) {
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');

  const handleSubmit = async () => {
    if (!desc.trim() || !valor) return;
    await onAdicionar({ descricao: desc, valorUnitario: parseFloat(valor) || 0 });
    setDesc(''); setValor(''); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-display">Adicionar Serviço</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {SUGESTOES.map((s) => (
              <button key={s} onClick={() => setDesc(s)} className="px-2.5 py-1 text-xs rounded-full border border-border hover:bg-accent-light hover:text-accent transition-colors">{s}</button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Descrição *</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={200} className="min-h-[44px]" placeholder="Ex: Troca de óleo" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Valor (R$) *</Label>
            <Input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} className="min-h-[44px]" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !desc.trim() || !valor}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
