import { formatarMoeda } from '@/lib/formatters';
import type { Peca } from '@/types/database';

interface Props { peca: Peca; qrUrl?: string; }

export function EtiquetaQRCode({ peca, qrUrl }: Props) {
  return (
    <div className="border border-dashed rounded p-2 flex gap-2 items-center" style={{ width: '190px', height: '114px' }}>
      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
        {qrUrl ? <img src={qrUrl} alt="QR" className="w-full h-full object-contain" /> : <span className="text-xs text-muted-foreground">QR</span>}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-semibold text-xs truncate">{peca.nome}</p>
        {peca.codigo && <p className="font-mono text-[10px] text-muted-foreground">{peca.codigo}</p>}
        <p className="font-mono font-bold text-sm text-accent mt-1">{formatarMoeda(peca.preco_venda)}</p>
      </div>
    </div>
  );
}
