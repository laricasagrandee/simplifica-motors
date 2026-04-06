import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import type { Peca } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  peca: Peca | null;
  onSalvar: (data: { pecaId: string; quantidade: number; precoCusto: number; observacao?: string }) => Promise<void>;
  loading: boolean;
}

export function EntradaEstoqueForm({ open, onClose, peca, onSalvar, loading }: Props) {
  const [qty, setQty] = useState('');
  const [custo, setCusto] = useState('');
  const [obs, setObs] = useState('');

  const novoEstoque = (peca?.estoque_atual ?? 0) + (parseInt(qty) || 0);
  const totalCusto = (parseInt(qty) || 0) * (parseFloat(custo) || 0);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!peca || !qty || parseInt(qty) <= 0) return;
    await onSalvar({ pecaId: peca.id, quantidade: parseInt(qty), precoCusto: parseFloat(custo) || 0, observacao: obs || undefined });
    setQty(''); setCusto(''); setObs('');
    onClose();
  };

  if (!peca) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Entrada de Estoque</DialogTitle>
        </DialogHeader>
        <p className="text-sm font-medium text-foreground">{peca.nome}</p>
        <p className="text-xs text-muted-foreground">Estoque atual: {peca.estoque_atual} {peca.unidade}</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantidade *</Label>
              <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="min-h-[44px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custo Unit. (R$)</Label>
              <Input type="number" step="0.01" min="0" value={custo} onChange={(e) => setCusto(e.target.value)} className="min-h-[44px]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observação</Label>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} rows={2} className="min-h-[44px]" />
          </div>

          <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Novo estoque:</span><span className="font-mono font-medium">{novoEstoque} {peca.unidade}</span></div>
            {totalCusto > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Total custo:</span><span className="font-mono font-medium">{formatarMoeda(totalCusto)}</span></div>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || !qty || parseInt(qty) <= 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Entrada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
