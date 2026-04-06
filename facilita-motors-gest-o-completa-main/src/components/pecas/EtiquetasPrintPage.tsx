import { EtiquetaQRCode } from './EtiquetaQRCode';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { Peca } from '@/types/database';

interface Props { pecas: Peca[]; }

export function EtiquetasPrintPage({ pecas }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <p className="text-sm text-muted-foreground">{pecas.length} etiquetas selecionadas</p>
        <Button onClick={() => window.print()} className="min-h-[44px] bg-accent text-accent-foreground gap-2">
          <Printer className="h-4 w-4" /> Imprimir Etiquetas
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3 print:gap-1">
        {pecas.map(p => (
          <EtiquetaQRCode key={p.id} peca={p} qrUrl={(p as unknown as Record<string, unknown>).qr_code_url as string} />
        ))}
      </div>
    </div>
  );
}
