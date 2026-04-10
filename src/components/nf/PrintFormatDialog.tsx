import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Receipt } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (formato: 'a4' | 'cupom') => void;
}

export function PrintFormatDialog({ open, onClose, onSelect }: Props) {
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
            onClick={() => onSelect('a4')}
          >
            <Printer className="h-8 w-8 text-muted-foreground" />
            <span className="font-semibold text-sm">Impressora Comum</span>
            <span className="text-xs text-muted-foreground">(A4)</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6 border-2 hover:border-primary"
            onClick={() => onSelect('cupom')}
          >
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <span className="font-semibold text-sm">Impressora Térmica</span>
            <span className="text-xs text-muted-foreground">(Cupom 80mm)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
