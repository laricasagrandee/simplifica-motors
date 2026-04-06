import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorOrcamento: number;
  onConfirm: (motivo: string) => Promise<void>;
  loading?: boolean;
}

const MOTIVOS = [
  { value: 'Preço alto', label: 'Preço alto' },
  { value: 'Vai fazer em outro lugar', label: 'Vai fazer em outro lugar' },
  { value: 'Não tem dinheiro agora', label: 'Não tem dinheiro agora' },
  { value: 'Desistiu do conserto', label: 'Desistiu do conserto' },
  { value: 'Sem resposta do cliente', label: 'Sem resposta do cliente' },
  { value: 'Outro', label: 'Outro' },
];

export function RecusaOrcamentoDialog({ open, onOpenChange, valorOrcamento, onConfirm, loading }: Props) {
  const [motivo, setMotivo] = useState('Preço alto');
  const [outroTexto, setOutroTexto] = useState('');

  const motivoFinal = motivo === 'Outro' ? outroTexto.trim() : motivo;

  const handleConfirm = async () => {
    if (!motivoFinal) return;
    await onConfirm(motivoFinal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Motivo da Recusa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase">Valor do orçamento</p>
            <MoneyDisplay valor={valorOrcamento} className="text-2xl font-display font-bold text-destructive" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Motivo</Label>
            <SearchableSelect value={motivo} onValueChange={setMotivo} options={MOTIVOS} placeholder="Selecione o motivo" />
          </div>

          {motivo === 'Outro' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Descreva o motivo</Label>
              <Input value={outroTexto} onChange={(e) => setOutroTexto(e.target.value)} placeholder="Digite o motivo..." className="min-h-[44px]" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading || !motivoFinal}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Recusa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
