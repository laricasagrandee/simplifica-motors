import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Receipt } from 'lucide-react';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (formato: 'a4' | 'cupom', salvar: boolean) => void;
}

export function PrintFormatDialog({ open, onClose, onSelect }: Props) {
  const [salvar, setSalvar] = useState(true);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Formato de Impressão</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6 border-2 hover:border-primary"
            onClick={() => onSelect('a4', salvar)}
          >
            <Printer className="h-8 w-8 text-muted-foreground" />
            <span className="font-semibold text-sm">Impressora Comum</span>
            <span className="text-xs text-muted-foreground">(A4)</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6 border-2 hover:border-primary"
            onClick={() => onSelect('cupom', salvar)}
          >
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <span className="font-semibold text-sm">Impressora Térmica</span>
            <span className="text-xs text-muted-foreground">(Cupom 80mm)</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="salvar-formato"
            checked={salvar}
            onCheckedChange={v => setSalvar(!!v)}
          />
          <label htmlFor="salvar-formato" className="text-sm text-muted-foreground cursor-pointer">
            Lembrar minha escolha
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
