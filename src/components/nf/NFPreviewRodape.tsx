import { formatarDataCurta } from '@/lib/formatters';

interface Props {
  nfId: string;
  emitidaEm?: string | null;
}

export function NFPreviewRodape({ nfId, emitidaEm }: Props) {
  

  return (
    <div className="border-t-2 border-foreground/20 pt-3 mt-4 space-y-1">
      {emitidaEm && (
        <div className="text-[10px] text-muted-foreground">
          <span>Emitido em: {formatarDataCurta(emitidaEm)}</span>
        </div>
      )}
      <p className="text-[9px] text-muted-foreground leading-tight">
        Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e).
      </p>
    </div>
  );
}
