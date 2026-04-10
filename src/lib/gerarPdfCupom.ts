import jsPDF from 'jspdf';
import { formatarMoeda, formatarCNPJ, formatarDataCurta } from '@/lib/formatters';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

export function gerarPdfCupom(nf: NotaFiscalCompleta) {
  const config = nf.config;
  const pageWidth = 80; // mm
  const ml = 3;
  const mr = pageWidth - 3;
  const contentWidth = mr - ml;
  let y = 5;

  const doc = new jsPDF({ unit: 'mm', format: [pageWidth, 300] });
  doc.setFont('helvetica');

  const center = (text: string, size: number, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += size * 0.45;
  };

  const leftRight = (left: string, right: string, size = 7) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'normal');
    doc.text(left, ml, y);
    doc.text(right, mr, y, { align: 'right' });
    y += size * 0.45;
  };

  const separator = () => {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('- - - - - - - - - - - - - - - - - - - - - - - - -', pageWidth / 2, y, { align: 'center' });
    y += 3;
  };

  const left = (text: string, size = 7, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, ml, y);
    y += lines.length * size * 0.45;
  };

  // Header
  center(config.nome_fantasia || config.razao_social || 'Facilita Motors', 9, true);
  if (config.cnpj) center(`CNPJ: ${formatarCNPJ(config.cnpj)}`, 7);
  if (config.telefone) center(`Tel: ${config.telefone}`, 7);
  if (config.endereco_completo) center(config.endereco_completo, 6);
  y += 1;

  separator();

  center(`COMPROVANTE Nº ${nf.numero}`, 9, true);
  if (nf.emitida_em) center(formatarDataCurta(nf.emitida_em), 7);
  y += 1;

  separator();

  // Cliente
  left('Cliente:', 7, true);
  left(nf.destinatario_nome || '—', 7);
  if (nf.destinatario_cpf_cnpj) left(`CPF/CNPJ: ${nf.destinatario_cpf_cnpj}`, 7);
  if (nf.veiculo) left(`${nf.veiculo.marca} ${nf.veiculo.modelo} - ${nf.veiculo.placa}`, 7);
  if (nf.os_numero) left(`OS: #${nf.os_numero}`, 7);
  y += 1;

  separator();

  // Itens
  left('ITENS:', 7, true);
  y += 1;

  const servicos = nf.itens.filter(i => i.tipo === 'servico');
  const pecas = nf.itens.filter(i => i.tipo === 'peca');

  const drawItems = (title: string, items: typeof nf.itens) => {
    if (items.length === 0) return;
    left(title, 7, true);
    items.forEach(item => {
      leftRight(`${item.quantidade}x ${item.descricao}`, formatarMoeda(item.valor_total), 7);
    });
    y += 1;
  };

  drawItems('Serviços:', servicos);
  drawItems('Peças:', pecas);

  separator();

  // Totais
  if (nf.desconto > 0) {
    leftRight('Desconto:', `-${formatarMoeda(nf.desconto)}`, 7);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', ml, y);
  doc.text(formatarMoeda(nf.valor), mr, y, { align: 'right' });
  y += 5;

  separator();

  // Footer
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  const footerLines = doc.splitTextToSize(
    'Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e).',
    contentWidth
  );
  doc.text(footerLines, pageWidth / 2, y, { align: 'center' });

  doc.save(`Cupom-${nf.numero}.pdf`);
}
