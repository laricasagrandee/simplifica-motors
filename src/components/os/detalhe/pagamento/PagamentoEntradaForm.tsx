import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import { FormaPagamentoBotoes } from './FormaPagamentoBotoes';
import { PagamentoDinheiro } from './PagamentoDinheiro';
import { PagamentoParcelado } from './PagamentoParcelado';
import { formatarMoeda } from '@/lib/formatters';
import { toast } from 'sonner';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import type { FormaPagamento } from '@/types/database';

interface Props {
  valorRestante: number;
  onAdicionar: (pag: { forma_pagamento: FormaPagamento; valor: number; parcelas: number; valor_recebido: number | null; troco: number | null }) => void;
  loading: boolean;
}

export function PagamentoEntradaForm({ valorRestante, onAdicionar, loading }: Props) {
  const [forma, setForma] = useState<FormaPagamento | null>(null);
  const [valor, setValor] = useState('');
  const [recebido, setRecebido] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const formaRef = useRef<HTMLDivElement>(null);
  const { data: config } = useConfiguracoes();

  const valorNum = valor ? parseFloat(valor) : valorRestante;
  const valorBase = Math.min(Math.max(valorNum, 0), valorRestante);

  // Calcular taxa de cartão de crédito
  const taxaCreditoAvista = Number(config?.taxa_cartao_credito ?? 3.49);
  const taxasParc = ((config as unknown as Record<string, unknown>)?.taxas_parcelamento as Record<string, number> | null) ?? {};

  let taxaPct = 0;
  if (forma === 'cartao_credito') {
    taxaPct = parcelas > 1 ? (taxasParc[String(parcelas)] ?? 4.99) : taxaCreditoAvista;
  }

  const totalComTaxa = forma === 'cartao_credito' && taxaPct > 0
    ? Math.round(valorBase * (1 + taxaPct / 100) * 100) / 100
    : valorBase;

  const valorFinal = totalComTaxa;
  const recebidoNum = parseFloat(recebido) || 0;
  const troco = forma === 'dinheiro' ? Math.max(0, recebidoNum - valorBase) : 0;
  const valorInvalido = valorBase <= 0 || valorBase > valorRestante + 0.01;

  const reset = () => {
    setForma(null); setValor(''); setRecebido(''); setParcelas(1);
    formaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleAdicionar = () => {
    if (!forma || valorInvalido) return;
    if (forma === 'dinheiro' && recebidoNum > 0 && recebidoNum < valorBase) {
      toast.error('Valor recebido menor que o valor');
      return;
    }
    onAdicionar({
      forma_pagamento: forma,
      valor: Math.round(valorFinal * 100) / 100,
      parcelas: forma === 'cartao_credito' ? parcelas : 1,
      valor_recebido: forma === 'dinheiro' ? (recebidoNum || valorBase) : null,
      troco: forma === 'dinheiro' ? troco : null,
    });
    reset();
  };

  return (
    <div className="space-y-4" ref={formaRef}>
      <FormaPagamentoBotoes forma={forma} onSelect={(f) => { setForma(f); setParcelas(1); }} />

      {forma && (
        <>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Valor</p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  type="number" step="0.01" min="0" max={valorRestante}
                  placeholder={(valorRestante).toFixed(2)}
                  value={valor} onChange={e => setValor(e.target.value)}
                  className="min-h-[44px] pl-9 font-mono text-lg"
                />
              </div>
              <Button variant="outline" size="sm" className="min-h-[44px] whitespace-nowrap text-xs"
                onClick={() => setValor(String(valorRestante))}>
                Restante {formatarMoeda(valorRestante)}
              </Button>
            </div>
          </div>

          {forma === 'dinheiro' && (
            <PagamentoDinheiro total={valorBase} valorRecebido={recebido} onValorChange={setRecebido} />
          )}
          {forma === 'cartao_credito' && (
            <PagamentoParcelado
              total={valorBase}
              parcelas={parcelas}
              onParcelasChange={setParcelas}
              taxaPct={taxaPct}
              totalComTaxa={totalComTaxa}
            />
          )}

          <Button
            onClick={handleAdicionar}
            disabled={!forma || valorInvalido || loading}
            className="w-full h-12 gap-2 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar {formatarMoeda(valorFinal)}
          </Button>
        </>
      )}
    </div>
  );
}
