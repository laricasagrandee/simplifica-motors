import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { formatarMoeda } from '@/lib/formatters';
import type { NFItem } from './NFPreviewItens';

interface Props {
  itens: NFItem[];
  desconto: number;
  valorTotal: number;
  aliquota: number;
}

export function NFPreviewTotais({ itens, desconto, valorTotal }: Props) {
  const subtotalServicos = itens.filter(i => i.tipo === 'servico').reduce((s, i) => s + i.valor_total, 0);
  const subtotalPecas = itens.filter(i => i.tipo === 'peca').reduce((s, i) => s + i.valor_total, 0);

  return (
    <div className="mb-4">
      <div className="ml-auto max-w-xs space-y-1">
        {subtotalServicos > 0 && (
          <Row label="Serviços" valor={subtotalServicos} />
        )}
        {subtotalPecas > 0 && (
          <Row label="Peças" valor={subtotalPecas} />
        )}
        {desconto > 0 && (
          <Row label="Desconto" valor={-desconto} negative />
        )}
        <div className="rounded-md border-2 border-foreground/20 p-2.5 flex justify-between items-center mt-2">
          <span className="font-semibold text-xs text-foreground">VALOR TOTAL</span>
          <MoneyDisplay valor={valorTotal} className="text-base font-display font-bold text-foreground" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, valor, negative, muted }: { label: string; valor: number; negative?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className={muted ? 'text-muted-foreground' : 'text-foreground'}>{label}</span>
      <span className={`font-mono ${negative ? 'text-destructive' : muted ? 'text-muted-foreground' : 'font-medium'}`}>
        {negative ? '-' : ''}{formatarMoeda(Math.abs(valor))}
      </span>
    </div>
  );
}
