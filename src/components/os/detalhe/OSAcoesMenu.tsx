import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, MessageCircle, FileText, CheckCircle, Send, FileDown, ClipboardList } from 'lucide-react';
import { formatarNumeroOS, formatarMoeda } from '@/lib/formatters';
import { gerarPdfOS, gerarPdfOrcamento } from '@/lib/gerarPdfOS';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useFotosPorOS } from '@/hooks/useOSFotos';
import { toast } from 'sonner';
import type { OrdemServico, Cliente, Veiculo, OSItem } from '@/types/database';

interface Props {
  os: OrdemServico;
  itens?: OSItem[];
}

function waLink(telefone: string, msg: string) {
  const tel = telefone.replace(/\D/g, '');
  return `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
}

export function OSAcoesMenu({ os, itens = [] }: Props) {
  const cliente = os.clientes as unknown as Cliente | undefined;
  const veiculo = os.motos as unknown as Veiculo | undefined;
  const tel = cliente?.telefone ?? '';
  const { data: config } = useConfiguracoes();
  const { data: fotos } = useFotosPorOS(os.id);

  const veiculoLabel = [veiculo?.marca, veiculo?.modelo, veiculo?.placa].filter(Boolean).join(' ');
  const osLabel = formatarNumeroOS(os.numero);

  const handleWhatsApp = () => {
    const msg =
      `Olá ${cliente?.nome ?? ''}! Sua ${osLabel} ` +
      `(${veiculoLabel}) está com status: ${os.status}. ` +
      `Valor: ${formatarMoeda(os.valor_total)}.`;
    window.open(waLink(tel, msg), '_blank');
  };

  const handleOrcamento = () => {
    const pecas = itens.filter((i) => i.tipo === 'peca');
    const servicos = itens.filter((i) => i.tipo === 'servico');

    let msg = `Olá ${cliente?.nome ?? ''}! Segue orçamento da ${osLabel} para seu ${veiculoLabel}:\n\n`;

    if (pecas.length > 0) {
      msg += '*Peças:*\n';
      pecas.forEach((p) => {
        msg += `• ${p.descricao} x${p.quantidade} = ${formatarMoeda(p.valor_total)}\n`;
      });
      msg += '\n';
    }

    if (servicos.length > 0) {
      msg += '*Serviços:*\n';
      servicos.forEach((s) => {
        msg += `• ${s.descricao} x${s.quantidade} = ${formatarMoeda(s.valor_total)}\n`;
      });
      msg += '\n';
    }

    if (os.desconto && os.desconto > 0) {
      msg += `Desconto: ${formatarMoeda(os.desconto)}\n`;
    }
    msg += `*Total: ${formatarMoeda(os.valor_total)}*\n\n`;
    msg += 'Responda *SIM* para aprovar.';

    window.open(waLink(tel, msg), '_blank');
  };

  const handleOSPronta = () => {
    const msg =
      `Olá ${cliente?.nome ?? ''}! Informamos que o serviço da ${osLabel} ` +
      `(${veiculoLabel}) foi concluído e seu veículo está pronto para retirada. ` +
      `Valor total: ${formatarMoeda(os.valor_total)}. Aguardamos você!`;
    window.open(waLink(tel, msg), '_blank');
  };

  const handleEnviarNF = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: nf } = await supabase
      .from('notas_fiscais')
      .select('numero, valor')
      .eq('os_id', os.id)
      .order('emitida_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!nf) return;

    const msg =
      `Olá ${cliente?.nome ?? ''}! Segue sua Nota Fiscal nº ${nf.numero} ` +
      `referente à ${osLabel}, no valor de ${formatarMoeda(nf.valor)}. Obrigado!`;
    window.open(waLink(tel, msg), '_blank');
  };

  const handleGerarPDF = async () => {
    if (!config) { toast.error('Configurações não carregadas'); return; }
    toast.info('Gerando PDF...');
    try {
      await gerarPdfOS(os, itens, config, fotos);
      toast.success('PDF gerado com sucesso!');
    } catch (e) { console.error(e); toast.error('Erro ao gerar PDF'); }
  };

  const handleGerarOrcamento = async () => {
    if (!config) { toast.error('Configurações não carregadas'); return; }
    toast.info('Gerando orçamento...');
    try {
      await gerarPdfOrcamento(os, itens, config);
      toast.success('Orçamento gerado com sucesso!');
    } catch (e) { console.error(e); toast.error('Erro ao gerar orçamento'); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir OS
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGerarPDF}>
          <FileDown className="h-4 w-4 mr-2" /> Gerar PDF da OS
        </DropdownMenuItem>
        {(os.status === 'em_orcamento' || os.status === 'aprovada') && (
          <DropdownMenuItem onClick={handleGerarOrcamento}>
            <ClipboardList className="h-4 w-4 mr-2" /> Gerar PDF Orçamento
          </DropdownMenuItem>
        )}
        {tel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" /> Enviar WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOrcamento}>
              <Send className="h-4 w-4 mr-2" /> Enviar Orçamento via WhatsApp
            </DropdownMenuItem>
            {os.status === 'concluida' && (
              <DropdownMenuItem onClick={handleOSPronta}>
                <CheckCircle className="h-4 w-4 mr-2" /> Notificar OS Pronta
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleEnviarNF}>
              <FileText className="h-4 w-4 mr-2" /> Enviar NF via WhatsApp
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
