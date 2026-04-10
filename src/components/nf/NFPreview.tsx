import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, MessageCircle, ArrowLeft } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { gerarPdfNF } from '@/lib/gerarPdfOS';
import { gerarPdfCupom } from '@/lib/gerarPdfCupom';
import { toast } from 'sonner';
import { NFPreviewHeader } from './NFPreviewHeader';
import { NFPreviewDestinatario } from './NFPreviewDestinatario';
import { NFPreviewItens } from './NFPreviewItens';
import { NFPreviewTotais } from './NFPreviewTotais';
import { NFPreviewRodape } from './NFPreviewRodape';
import { NFCupomPreview } from './NFCupomPreview';
import { PrintFormatDialog } from './PrintFormatDialog';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

interface Props {
  nf: NotaFiscalCompleta;
}

export function NFPreview({ nf }: Props) {
  const tel = nf.destinatario_telefone?.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Olá! Segue seu Comprovante nº ${nf.numero} no valor de ${formatarMoeda(nf.valor)}. Facilita Motors.`
  );

  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'print' | 'pdf' | null>(null);
  const [chosenFormat, setChosenFormat] = useState<'a4' | 'cupom' | null>(null);
  const cupomRef = useRef<HTMLDivElement>(null);

  const executeAction = (formato: 'a4' | 'cupom', action: 'print' | 'pdf') => {
    if (action === 'pdf') {
      toast.info('Gerando PDF...');
      try {
        if (formato === 'cupom') {
          gerarPdfCupom(nf);
        } else {
          gerarPdfNF(nf);
        }
        toast.success('PDF gerado!');
      } catch (e) {
        console.error(e);
        toast.error('Erro ao gerar PDF');
      }
    } else {
      if (formato === 'cupom') {
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        window.print();
      }
    }
    // Reset after action
    setChosenFormat(null);
    setPendingAction(null);
  };

  const handleAction = (action: 'print' | 'pdf') => {
    setPendingAction(action);
    setFormatDialogOpen(true);
  };

  const handleFormatSelect = (formato: 'a4' | 'cupom') => {
    setFormatDialogOpen(false);
    setChosenFormat(formato);
  };

  const handleConfirm = () => {
    if (chosenFormat && pendingAction) {
      executeAction(chosenFormat, pendingAction);
    }
  };

  const handleVoltar = () => {
    setChosenFormat(null);
    setPendingAction(null);
  };

  const showPreviewStep = chosenFormat !== null && pendingAction !== null;

  return (
    <div className="max-w-[210mm] mx-auto">
      {/* Preview content */}
      {(!showPreviewStep || chosenFormat === 'a4') && (
        <div className={`bg-background border border-border rounded-lg shadow-sm p-6 sm:p-8 print:shadow-none print:border-none print:p-4 ${showPreviewStep && chosenFormat === 'a4' ? '' : ''}`}>
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
      )}

      {showPreviewStep && chosenFormat === 'cupom' && (
        <div ref={cupomRef} className="bg-background border border-border rounded-lg shadow-sm p-6 sm:p-8">
          <NFCupomPreview nf={nf} />
        </div>
      )}

      {/* Action buttons */}
      {!showPreviewStep && (
        <div className="flex gap-2 mt-4 print:hidden">
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => handleAction('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />PDF
          </Button>
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => handleAction('print')}>
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
      )}

      {/* Confirmation bar after choosing format */}
      {showPreviewStep && (
        <div className="flex gap-2 mt-4 print:hidden">
          <Button variant="outline" className="min-h-[44px]" onClick={handleVoltar}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
          <Button className="flex-1 min-h-[44px] bg-accent text-accent-foreground" onClick={handleConfirm}>
            {pendingAction === 'pdf' ? (
              <><FileDown className="h-4 w-4 mr-2" />Confirmar PDF</>
            ) : (
              <><Printer className="h-4 w-4 mr-2" />Confirmar Impressão</>
            )}
          </Button>
        </div>
      )}

      <PrintFormatDialog
        open={formatDialogOpen}
        onClose={() => { setFormatDialogOpen(false); setPendingAction(null); }}
        onSelect={handleFormatSelect}
      />
    </div>
  );
}
