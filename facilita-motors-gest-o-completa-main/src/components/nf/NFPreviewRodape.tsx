import { formatarDataCurta } from '@/lib/formatters';

interface Props {
  nfId: string;
  emitidaEm?: string | null;
}

export function NFPreviewRodape({ nfId, emitidaEm }: Props) {
  const codigoVerificacao = nfId.slice(0, 8).toUpperCase();

  return (
    <div className="border-t-2 border-foreground/20 pt-3 mt-4 space-y-1">
      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
        <span>Código de verificação: <span className="font-mono font-bold">{codigoVerificacao}</span></span>
        {emitidaEm && <span>Emitido em: {formatarDataCurta(emitidaEm)}</span>}
      </div>
      <p className="text-[9px] text-muted-foreground leading-tight">
        Documento gerado eletronicamente pelo sistema Facilita Motors. 
        Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e) emitida pela prefeitura/SEFAZ.
      </p>
    </div>
  );
}
