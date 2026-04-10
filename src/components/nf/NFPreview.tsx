import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, MessageCircle } from 'lucide-react';
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
import { useConfiguracoes, useAtualizarConfiguracoes } from '@/hooks/useConfiguracoes';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

interface Props {
  nf: NotaFiscalCompleta;
}

export function NFPreview({ nf }: Props) {
  const tel = nf.destinatario_telefone?.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Olá! Segue seu Comprovante nº ${nf.numero} no valor de ${formatarMoeda(nf.valor)}. Facilita Motors.`
  );

  const config = useConfiguracoes();
  const atualizar = useAtualizarConfiguracoes();
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'print' | 'pdf' | null>(null);
  const [cupomMode, setCupomMode] = useState(false);
  const cupomRef = useRef<HTMLDivElement>(null);

  const savedFormat = config.data?.formato_impressao as 'a4' | 'cupom' | null;

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
        setCupomMode(true);
        setTimeout(() => {
          window.print();
          setCupomMode(false);
        }, 300);
      } else {
        window.print();
      }
    }
  };

  const handleAction = (action: 'print' | 'pdf') => {
    if (savedFormat) {
      executeAction(savedFormat, action);
    } else {
      setPendingAction(action);
      setFormatDialogOpen(true);
    }
  };

  const handleFormatSelect = (formato: 'a4' | 'cupom', salvar: boolean) => {
    setFormatDialogOpen(false);
    if (salvar && config.data) {
      atualizar.mutate({ id: config.data.id, formato_impressao: formato } as any);
    }
    if (pendingAction) {
      executeAction(formato, pendingAction);
      setPendingAction(null);
    }
  };

  return (
    <div className="max-w-[210mm] mx-auto">
      {/* A4 document body - hidden when printing in cupom mode */}
      <div className={`bg-background border border-border rounded-lg shadow-sm p-6 sm:p-8 print:shadow-none print:border-none print:p-4 ${cupomMode ? 'print:hidden' : ''}`}>
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

      {/* Cupom layout - only visible when printing in cupom mode */}
      {cupomMode && (
        <div ref={cupomRef} className="hidden print:block">
          <NFCupomPreview nf={nf} />
        </div>
      )}

      {/* Actions */}
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

      <PrintFormatDialog
        open={formatDialogOpen}
        onClose={() => { setFormatDialogOpen(false); setPendingAction(null); }}
        onSelect={handleFormatSelect}
      />
    </div>
  );
}
