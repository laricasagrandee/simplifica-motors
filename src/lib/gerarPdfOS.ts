import jsPDF from 'jspdf';
import { formatarMoeda, formatarNumeroOS, formatarDataCurta, formatarCNPJ } from '@/lib/formatters';
import type { OrdemServico, OSItem, Configuracao, OSFoto, Cliente, Veiculo, NotaFiscal } from '@/types/database';
import type { NotaFiscalCompleta } from '@/hooks/useNFCompleta';

function drawHeader(doc: jsPDF, config: Configuracao, y: number): { hx: number; y: number } {
  const pw = doc.internal.pageSize.getWidth();
  if (config.logo_url) {
    // logo loaded externally before calling
  }
  const hx = 14;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(config.nome_fantasia || config.razao_social || 'Oficina', hx, y + 6);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (config.cnpj) doc.text(`CNPJ: ${formatarCNPJ(config.cnpj)}`, hx, y + 12);
  if (config.telefone) doc.text(`Tel: ${config.telefone}`, hx, y + 17);
  if (config.endereco_completo) doc.text(config.endereco_completo.slice(0, 70), hx, y + 22);
  return { hx, y };
}

async function loadImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function gerarPdfOS(
  os: OrdemServico,
  itens: OSItem[],
  config: Configuracao,
  _fotos?: OSFoto[],
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const cliente = os.clientes as unknown as Cliente | undefined;
  const veiculo = os.motos as unknown as Veiculo | undefined;
  let y = 15;

  // --- Header: logo + oficina ---
  if (config.logo_url) {
    const img = await loadImage(config.logo_url);
    if (img) { doc.addImage(img, 'PNG', 14, y, 22, 22); }
  }
  const hx = config.logo_url ? 40 : 14;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(config.nome_fantasia || config.razao_social || 'Oficina', hx, y + 6);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (config.cnpj) doc.text(`CNPJ: ${formatarCNPJ(config.cnpj)}`, hx, y + 12);
  if (config.telefone) doc.text(`Tel: ${config.telefone}`, hx, y + 17);
  if (config.endereco_completo) doc.text(config.endereco_completo.slice(0, 70), hx, y + 22);

  // --- OS number + status ---
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(formatarNumeroOS(os.numero), pw - 14, y + 8, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${os.status.toUpperCase()}`, pw - 14, y + 14, { align: 'right' });
  if (os.data_abertura) doc.text(`Abertura: ${formatarDataCurta(os.data_abertura)}`, pw - 14, y + 19, { align: 'right' });
  y += 30;
  doc.setDrawColor(200); doc.line(14, y, pw - 14, y); y += 6;

  // --- Cliente ---
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Cliente', 14, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Nome: ${cliente?.nome ?? '-'}`, 14, y);
  doc.text(`Telefone: ${cliente?.telefone ?? '-'}`, 105, y); y += 5;
  doc.text(`CPF/CNPJ: ${cliente?.cpf_cnpj ?? '-'}`, 14, y); y += 6;

  // --- Veículo ---
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Veículo', 14, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const veicParts = [veiculo?.marca, veiculo?.modelo].filter(Boolean).join(' ') || 'Veículo';
  const veicInfo = `${veicParts} | Placa: ${veiculo?.placa || '-'}`;
  doc.text(veicInfo, 14, y);
  if (veiculo?.quilometragem) doc.text(`KM: ${veiculo.quilometragem}`, 150, y);
  y += 7;

  // --- Problema / Diagnóstico ---
  if (os.problema_relatado) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Problema Relatado', 14, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const lines = doc.splitTextToSize(os.problema_relatado, pw - 28);
    doc.text(lines, 14, y); y += lines.length * 4 + 2;
  }
  if (os.diagnostico) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Diagnóstico', 14, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const lines = doc.splitTextToSize(os.diagnostico, pw - 28);
    doc.text(lines, 14, y); y += lines.length * 4 + 2;
  }
  doc.line(14, y, pw - 14, y); y += 6;

  // --- Tabela de Itens ---
  const pecas = itens.filter((i) => i.tipo === 'peca');
  const servicos = itens.filter((i) => i.tipo === 'servico');

  function drawTable(title: string, items: OSItem[]) {
    if (items.length === 0) return;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(title, 14, y); y += 5;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('Descrição', 14, y); doc.text('Qtd', 120, y); doc.text('Unit.', 140, y); doc.text('Total', 170, y); y += 4;
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      if (y > 265) { doc.addPage(); y = 15; }
      const desc = item.descricao.length > 50 ? item.descricao.slice(0, 47) + '...' : item.descricao;
      doc.text(desc, 14, y);
      doc.text(String(item.quantidade), 120, y);
      doc.text(formatarMoeda(item.valor_unitario), 140, y);
      doc.text(formatarMoeda(item.valor_total), 170, y);
      y += 4.5;
    });
    y += 3;
  }

  drawTable('Peças', pecas);
  drawTable('Serviços', servicos);

  // --- Resumo ---
  if (y > 240) { doc.addPage(); y = 15; }
  doc.line(14, y, pw - 14, y); y += 6;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const rx = pw - 14;
  doc.text(`Peças: ${formatarMoeda(os.valor_pecas ?? 0)}`, rx, y, { align: 'right' }); y += 5;
  doc.text(`Mão de Obra: ${formatarMoeda(os.valor_mao_obra ?? 0)}`, rx, y, { align: 'right' }); y += 5;
  if (os.desconto && os.desconto > 0) { doc.text(`Desconto: -${formatarMoeda(os.desconto)}`, rx, y, { align: 'right' }); y += 5; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(`TOTAL: ${formatarMoeda(os.valor_total ?? 0)}`, rx, y, { align: 'right' }); y += 12;

  // --- Assinatura ---
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (os.assinatura_cliente) {
    const sigImg = await loadImage(os.assinatura_cliente);
    if (sigImg) { doc.addImage(sigImg, 'PNG', 14, y, 50, 20); y += 22; }
  } else {
    y += 20;
  }
  doc.line(14, y, 90, y); y += 4;
  doc.text('Assinatura do Cliente', 14, y);
  doc.text(`Data: ____/____/________`, 100, y);

  doc.save(`${formatarNumeroOS(os.numero)}.pdf`);
}

// ===================== ORÇAMENTO =====================

export async function gerarPdfOrcamento(
  os: OrdemServico,
  itens: OSItem[],
  config: Configuracao,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const cliente = os.clientes as unknown as Cliente | undefined;
  const veiculo = os.motos as unknown as Veiculo | undefined;
  let y = 15;

  // Header
  if (config.logo_url) {
    const img = await loadImage(config.logo_url);
    if (img) doc.addImage(img, 'PNG', 14, y, 22, 22);
  }
  const hx = config.logo_url ? 40 : 14;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(config.nome_fantasia || config.razao_social || 'Oficina', hx, y + 6);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (config.cnpj) doc.text(`CNPJ: ${formatarCNPJ(config.cnpj)}`, hx, y + 12);
  if (config.telefone) doc.text(`Tel: ${config.telefone}`, hx, y + 17);

  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pw - 14, y + 8, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(formatarNumeroOS(os.numero), pw - 14, y + 14, { align: 'right' });
  if (os.data_abertura) doc.text(`Data: ${formatarDataCurta(os.data_abertura)}`, pw - 14, y + 19, { align: 'right' });
  y += 30;
  doc.setDrawColor(200); doc.line(14, y, pw - 14, y); y += 6;

  // Cliente
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Cliente', 14, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Nome: ${cliente?.nome ?? '-'}`, 14, y);
  doc.text(`Telefone: ${cliente?.telefone ?? '-'}`, 105, y); y += 5;
  doc.text(`CPF/CNPJ: ${cliente?.cpf_cnpj ?? '-'}`, 14, y); y += 6;

  // Veículo
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Veículo', 14, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const veicParts2 = [veiculo?.marca, veiculo?.modelo].filter(Boolean).join(' ') || 'Veículo';
  doc.text(`${veicParts2} | Placa: ${veiculo?.placa || '-'}`, 14, y); y += 7;
  doc.line(14, y, pw - 14, y); y += 6;

  // Itens
  const pecas = itens.filter((i) => i.tipo === 'peca');
  const servicos = itens.filter((i) => i.tipo === 'servico');

  function drawItems(title: string, items: OSItem[]) {
    if (items.length === 0) return;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(title, 14, y); y += 5;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('Descrição', 14, y); doc.text('Qtd', 120, y); doc.text('Unit.', 140, y); doc.text('Total', 170, y); y += 4;
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      if (y > 265) { doc.addPage(); y = 15; }
      const desc = item.descricao.length > 50 ? item.descricao.slice(0, 47) + '...' : item.descricao;
      doc.text(desc, 14, y); doc.text(String(item.quantidade), 120, y);
      doc.text(formatarMoeda(item.valor_unitario), 140, y); doc.text(formatarMoeda(item.valor_total), 170, y);
      y += 4.5;
    });
    y += 3;
  }
  drawItems('Peças', pecas);
  drawItems('Serviços', servicos);

  // Total
  if (y > 240) { doc.addPage(); y = 15; }
  doc.line(14, y, pw - 14, y); y += 6;
  const rx = pw - 14;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Peças: ${formatarMoeda(os.valor_pecas ?? 0)}`, rx, y, { align: 'right' }); y += 5;
  doc.text(`Mão de Obra: ${formatarMoeda(os.valor_mao_obra ?? 0)}`, rx, y, { align: 'right' }); y += 5;
  if (os.desconto && os.desconto > 0) { doc.text(`Desconto: -${formatarMoeda(os.desconto)}`, rx, y, { align: 'right' }); y += 5; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(`TOTAL: ${formatarMoeda(os.valor_total ?? 0)}`, rx, y, { align: 'right' }); y += 12;

  // Validade
  doc.setFontSize(9); doc.setFont('helvetica', 'italic');
  doc.text('Orçamento válido por 15 dias.', 14, y); y += 15;

  // Assinatura aprovação
  if (y > 260) { doc.addPage(); y = 15; }
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.line(14, y, 90, y); y += 4;
  doc.text('Assinatura de Aprovação', 14, y);
  doc.text('Data: ____/____/________', 100, y);

  doc.save(`Orcamento-${formatarNumeroOS(os.numero)}.pdf`);
}

// ===================== NOTA FISCAL =====================

export async function gerarPdfNF(nf: NotaFiscalCompleta) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ml = 15; const mr = pw - 15;
  let y = 15;
  const config = nf.config;

  // Header — logo + emitente
  if (config.logo_url) {
    const img = await loadImage(config.logo_url);
    if (img) doc.addImage(img, 'PNG', ml, y, 20, 20);
  }
  const hx = config.logo_url ? ml + 24 : ml;
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(config.nome_fantasia || config.razao_social || 'Empresa', hx, y + 6);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  if (config.cnpj) doc.text(`CNPJ: ${formatarCNPJ(config.cnpj)}`, hx, y + 11);
  if (config.ie) doc.text(`IE: ${config.ie}`, hx, y + 15);
  if (config.telefone) doc.text(`Tel: ${config.telefone}`, hx, y + 19);
  if (config.endereco_completo) doc.text(config.endereco_completo.slice(0, 65), hx, y + 23);

  // Title right
  const titulo = nf.tipo === 'servico' ? 'COMPROVANTE DE SERVIÇO' : 'COMPROVANTE DE PRODUTO';
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(titulo, mr, y + 6, { align: 'right' });
  doc.setFontSize(14);
  doc.text(`Nº ${nf.numero}`, mr, y + 14, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  
  if (nf.emitida_em) doc.text(formatarDataCurta(nf.emitida_em), mr, y + 23, { align: 'right' });
  y += 28;
  doc.setDrawColor(180); doc.setLineWidth(0.5); doc.line(ml, y, mr, y); y += 6;

  // Destinatário box
  doc.setDrawColor(200); doc.rect(ml, y - 2, mr - ml, nf.veiculo ? 22 : 16);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', ml + 2, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${nf.destinatario_nome ?? '-'}`, ml + 2, y + 7);
  doc.text(`CPF/CNPJ: ${nf.destinatario_cpf_cnpj ?? '-'}`, 110, y + 7);
  if (nf.veiculo) {
    const nfVeicParts = [nf.veiculo.marca, nf.veiculo.modelo].filter(Boolean).join(' ') || 'Veículo';
    doc.text(`Veículo: ${nfVeicParts} | Placa: ${nf.veiculo.placa || '-'}${nf.veiculo.ano ? ` | Ano: ${nf.veiculo.ano}` : ''}`, ml + 2, y + 12);
    if (nf.os_numero) doc.text(`OS: #${nf.os_numero}`, ml + 2, y + 17);
    y += 24;
  } else {
    if (nf.os_numero) doc.text(`OS: #${nf.os_numero}`, ml + 2, y + 12);
    y += 18;
  }
  y += 4;

  // Items table
  if (nf.itens.length > 0) {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('ITENS', ml, y); y += 5;

    // Header row
    doc.setFillColor(230, 230, 230);
    doc.rect(ml, y - 3.5, mr - ml, 6, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('#', ml + 1, y); doc.text('Descrição', ml + 8, y);
    doc.text('Qtd', 128, y); doc.text('Valor Unit.', 145, y); doc.text('Valor Total', mr - 2, y, { align: 'right' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    const servicos = nf.itens.filter(i => i.tipo === 'servico');
    const pecas = nf.itens.filter(i => i.tipo === 'peca');

    const drawGroup = (title: string, items: typeof nf.itens) => {
      if (items.length === 0) return;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.text(title, ml + 1, y); y += 4;
      doc.setFont('helvetica', 'normal');
      items.forEach((item, idx) => {
        if (y > 268) { doc.addPage(); y = 15; }
        if (idx % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(ml, y - 3, mr - ml, 4.5, 'F'); }
        const desc = item.descricao.length > 50 ? item.descricao.slice(0, 47) + '...' : item.descricao;
        doc.text(String(idx + 1), ml + 1, y);
        doc.text(desc, ml + 8, y);
        doc.text(String(item.quantidade), 130, y);
        doc.text(formatarMoeda(item.valor_unitario), 145, y);
        doc.text(formatarMoeda(item.valor_total), mr - 2, y, { align: 'right' });
        y += 4.5;
      });
      const sub = items.reduce((s, i) => s + i.valor_total, 0);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.text(`Subtotal ${title}: ${formatarMoeda(sub)}`, mr - 2, y, { align: 'right' }); y += 5;
    };

    drawGroup('Serviços', servicos);
    drawGroup('Peças', pecas);
    doc.setDrawColor(200); doc.line(ml, y, mr, y); y += 6;
  }

  // Totals
  if (y > 245) { doc.addPage(); y = 15; }
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  const tx = mr - 2;
  if (nf.desconto > 0) { doc.text(`Desconto: -${formatarMoeda(nf.desconto)}`, tx, y, { align: 'right' }); y += 5; }
  if (nf.aliquota > 0) { doc.text(`Impostos estimados (${nf.aliquota}%) — já inclusos no valor`, tx, y, { align: 'right' }); y += 5; }

  // Total highlight
  doc.setFillColor(40, 40, 40);
  doc.rect(mr - 65, y - 3, 67, 9, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(`TOTAL: ${formatarMoeda(nf.valor)}`, tx, y + 2, { align: 'right' });
  doc.setTextColor(0); y += 14;

  // Footer
  doc.setDrawColor(180); doc.line(ml, y, mr, y); y += 5;
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120);
  doc.text('Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e).', ml, y); y += 3;
  if (config.cnpj) doc.text(`Emitente: ${config.razao_social || config.nome_fantasia || ''} — CNPJ: ${formatarCNPJ(config.cnpj)}`, ml, y);
  doc.setTextColor(0);

  doc.save(`NF-${nf.numero}.pdf`);
}
