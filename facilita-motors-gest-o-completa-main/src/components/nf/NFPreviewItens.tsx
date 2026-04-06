import { formatarMoeda } from '@/lib/formatters';

export interface NFItem {
  id?: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface Props {
  itens: NFItem[];
}

export function NFPreviewItens({ itens }: Props) {
  if (itens.length === 0) return null;

  const servicos = itens.filter(i => i.tipo === 'servico');
  const pecas = itens.filter(i => i.tipo === 'peca');
  const subtotalServicos = servicos.reduce((s, i) => s + i.valor_total, 0);
  const subtotalPecas = pecas.reduce((s, i) => s + i.valor_total, 0);

  const renderGroup = (title: string, emoji: string, items: NFItem[], subtotal: number) => {
    if (items.length === 0) return null;
    return (
      <>
        <tr>
          <td colSpan={5} className="pt-3 pb-1 text-xs font-bold uppercase text-muted-foreground">
            {emoji} {title}
          </td>
        </tr>
        {items.map((item, idx) => (
          <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
            <td className="py-1.5 px-2 text-xs">{idx + 1}</td>
            <td className="py-1.5 px-2 text-xs">{item.descricao}</td>
            <td className="py-1.5 px-2 text-xs text-center">{item.quantidade}</td>
            <td className="py-1.5 px-2 text-xs text-right font-mono">{formatarMoeda(item.valor_unitario)}</td>
            <td className="py-1.5 px-2 text-xs text-right font-mono">{formatarMoeda(item.valor_total)}</td>
          </tr>
        ))}
        <tr className="border-t border-border">
          <td colSpan={4} className="py-1 px-2 text-xs text-right text-muted-foreground">
            Subtotal {title}
          </td>
          <td className="py-1 px-2 text-xs text-right font-mono font-semibold">
            {formatarMoeda(subtotal)}
          </td>
        </tr>
      </>
    );
  };

  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">ITENS</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-foreground/10 text-foreground">
            <th className="py-1.5 px-2 text-xs text-left w-8">#</th>
            <th className="py-1.5 px-2 text-xs text-left">Descrição</th>
            <th className="py-1.5 px-2 text-xs text-center w-12">Qtd</th>
            <th className="py-1.5 px-2 text-xs text-right w-24">Valor Unit.</th>
            <th className="py-1.5 px-2 text-xs text-right w-24">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {renderGroup('Serviços', '🔧', servicos, subtotalServicos)}
          {renderGroup('Peças', '📦', pecas, subtotalPecas)}
        </tbody>
      </table>
    </div>
  );
}
