import { formatarMoeda, formatarCNPJ, formatarDataCurta } from '@/lib/formatters';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

interface Props {
  nf: NotaFiscalCompleta;
}

export function NFCupomPreview({ nf }: Props) {
  const config = nf.config;
  const servicos = nf.itens.filter(i => i.tipo === 'servico');
  const pecas = nf.itens.filter(i => i.tipo === 'peca');

  const Separator = () => (
    <div className="text-center text-[8px] text-muted-foreground leading-none select-none my-1">
      - - - - - - - - - - - - - - - - - - - - - - - - - - -
    </div>
  );

  return (
    <div className="mx-auto font-mono text-foreground" style={{ maxWidth: '80mm', fontSize: '10px', lineHeight: '1.4' }}>
      {/* Header - Oficina */}
      <div className="text-center mb-1">
        <p className="font-bold text-xs uppercase">
          {config.nome_fantasia || config.razao_social || 'Facilita Motors'}
        </p>
        {config.cnpj && <p>CNPJ: {formatarCNPJ(config.cnpj)}</p>}
        {config.telefone && <p>Tel: {config.telefone}</p>}
        {config.endereco_completo && <p className="text-[9px]">{config.endereco_completo}</p>}
      </div>

      <Separator />

      {/* Tipo + Número */}
      <div className="text-center font-bold text-xs">
        COMPROVANTE Nº {nf.numero}
      </div>
      {nf.emitida_em && (
        <div className="text-center text-[9px]">{formatarDataCurta(nf.emitida_em)}</div>
      )}

      <Separator />

      {/* Cliente */}
      <div className="mb-1">
        <p className="font-bold text-[9px] uppercase">Cliente:</p>
        <p>{nf.destinatario_nome || '—'}</p>
        {nf.destinatario_cpf_cnpj && <p>CPF/CNPJ: {nf.destinatario_cpf_cnpj}</p>}
      </div>

      {/* Veículo */}
      {nf.veiculo && (
        <div className="mb-1">
          <p>{nf.veiculo.marca} {nf.veiculo.modelo} - {nf.veiculo.placa}</p>
        </div>
      )}
      {nf.os_numero && <p>OS: #{nf.os_numero}</p>}

      <Separator />

      {/* Itens */}
      <p className="font-bold text-[9px] uppercase mb-0.5">Itens:</p>

      {servicos.length > 0 && (
        <>
          <p className="text-[9px] font-bold">Serviços:</p>
          {servicos.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="truncate mr-2" style={{ maxWidth: '55mm' }}>
                {item.quantidade}x {item.descricao}
              </span>
              <span className="whitespace-nowrap">{formatarMoeda(item.valor_total)}</span>
            </div>
          ))}
        </>
      )}

      {pecas.length > 0 && (
        <>
          <p className="text-[9px] font-bold mt-1">Peças:</p>
          {pecas.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="truncate mr-2" style={{ maxWidth: '55mm' }}>
                {item.quantidade}x {item.descricao}
              </span>
              <span className="whitespace-nowrap">{formatarMoeda(item.valor_total)}</span>
            </div>
          ))}
        </>
      )}

      <Separator />

      {/* Totais */}
      {nf.desconto > 0 && (
        <div className="flex justify-between">
          <span>Desconto:</span>
          <span>-{formatarMoeda(nf.desconto)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-xs mt-1">
        <span>TOTAL:</span>
        <span>{formatarMoeda(nf.valor)}</span>
      </div>

      <Separator />

      {/* Footer */}
      <p className="text-center text-[8px] text-muted-foreground mt-1 leading-tight">
        Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e).
      </p>
    </div>
  );
}
