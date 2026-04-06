import { Button } from '@/components/ui/button';
import { Printer, FileDown, MessageCircle } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { gerarPdfNF } from '@/lib/gerarPdfOS';
import { toast } from 'sonner';
import { NFPreviewHeader } from './NFPreviewHeader';
import { NFPreviewDestinatario } from './NFPreviewDestinatario';
import { NFPreviewItens } from './NFPreviewItens';
import { NFPreviewTotais } from './NFPreviewTotais';
import { NFPreviewRodape } from './NFPreviewRodape';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

interface Props {
  nf: NotaFiscalCompleta;
}

export function NFPreview({ nf }: Props) {
  const tel = nf.destinatario_telefone?.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Olá! Segue sua Nota Fiscal nº ${nf.numero} no valor de ${formatarMoeda(nf.valor)}. Facilita Motors.`
  );

  const handlePDF = async () => {
    toast.info('Gerando PDF...');
    try {
      await gerarPdfNF(nf);
      toast.success('PDF gerado!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="max-w-[210mm] mx-auto">
      {/* Document body */}
      <div className="bg-background border border-border rounded-lg shadow-sm p-6 sm:p-8 print:shadow-none print:border-none print:p-4">
        <NFPreviewHeader
          config={nf.config}
          numero={nf.numero}
          tipo={nf.tipo}
          serie={nf.serie}
          emitidaEm={nf.emitida_em}
        />

        <NFPreviewDestinatario
          nome={nf.destinatario_nome}
          cpfCnpj={nf.destinatario_cpf_cnpj}
          telefone={nf.destinatario_telefone}
          email={nf.destinatario_email}
          veiculo={nf.veiculo}
          osNumero={nf.os_numero}
        />

        <NFPreviewItens itens={nf.itens} />

        <NFPreviewTotais
          itens={nf.itens}
          desconto={nf.desconto}
          valorTotal={nf.valor}
          aliquota={nf.aliquota}
        />

        <NFPreviewRodape nfId={nf.id} emitidaEm={nf.emitida_em} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 print:hidden">
        <Button variant="outline" className="flex-1 min-h-[44px]" onClick={handlePDF}>
          <FileDown className="h-4 w-4 mr-2" />PDF
        </Button>
        <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />Imprimir
        </Button>
        {tel && (
          <Button variant="outline" className="flex-1 min-h-[44px]" asChild>
            <a href={`https://wa.me/55${tel}?text=${msg}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
