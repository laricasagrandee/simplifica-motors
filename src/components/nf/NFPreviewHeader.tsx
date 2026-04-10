import { formatarCNPJ, formatarDataCurta } from '@/lib/formatters';
import type { Configuracao } from '@/types/database';

interface Props {
  config: Configuracao;
  numero: number | string;
  tipo: string;
  serie?: string | null;
  emitidaEm?: string | null;
}

export function NFPreviewHeader({ config, numero, tipo, serie, emitidaEm }: Props) {
  const titulo = tipo === 'servico' ? 'COMPROVANTE DE SERVIÇO' : 'COMPROVANTE DE PRODUTO';

  return (
    <div className="border-b-2 border-foreground/20 pb-4 mb-4">
      <div className="flex justify-between items-start gap-4">
        {/* Emitente */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {config.logo_url && (
            <img src={config.logo_url} alt="Logo" className="h-14 w-14 object-contain rounded shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-base text-foreground truncate">
              {config.nome_fantasia || config.razao_social || 'Facilita Motors'}
            </p>
            {config.razao_social && config.nome_fantasia && (
              <p className="text-[10px] text-muted-foreground truncate">{config.razao_social}</p>
            )}
            {config.cnpj && (
              <p className="text-xs text-muted-foreground">CNPJ: {formatarCNPJ(config.cnpj)}</p>
            )}
            {config.ie && <p className="text-xs text-muted-foreground">IE: {config.ie}</p>}
            <div className="flex flex-wrap gap-x-3 text-[10px] text-muted-foreground mt-0.5">
              {config.telefone && <span>📞 {config.telefone}</span>}
              {config.email && <span>✉️ {config.email}</span>}
            </div>
            {config.endereco_completo && (
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{config.endereco_completo}</p>
            )}
          </div>
        </div>

        {/* NF info */}
        <div className="text-right shrink-0">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">{titulo}</p>
          <p className="font-mono font-bold text-2xl text-foreground">Nº {numero}</p>
          
          {emitidaEm && <p className="text-xs text-muted-foreground">{formatarDataCurta(emitidaEm)}</p>}
        </div>
      </div>
    </div>
  );
}
