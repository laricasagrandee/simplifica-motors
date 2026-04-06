import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDVLayout } from '@/components/pdv/PDVLayout';
import { PDVBuscaProduto } from '@/components/pdv/PDVBuscaProduto';
import { PDVCarrinho } from '@/components/pdv/PDVCarrinho';
import { PDVPagamentoDialog } from '@/components/pdv/PDVPagamentoDialog';
import { PDVHistorico } from '@/components/pdv/PDVHistorico';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCriarVenda } from '@/hooks/usePDV';
import { useCaixaHoje } from '@/hooks/useCaixa';
import type { CarrinhoItem } from '@/components/pdv/PDVCarrinhoItem';
import type { Peca, FormaPagamento } from '@/types/database';

export default function PDVPage() {
  const navigate = useNavigate();
  const { data: caixa, isLoading: caixaLoading } = useCaixaHoje();
  const caixaAberto = caixa?.status === 'aberto';

  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [tipoDesconto, setTipoDesconto] = useState<'valor' | 'percentual'>('valor');
  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const criarVenda = useCriarVenda();

  const subtotal = itens.reduce((s, i) => s + i.valor_unitario * i.quantidade, 0);
  const descontoReais = tipoDesconto === 'percentual' ? (subtotal * desconto) / 100 : desconto;
  const total = Math.max(0, subtotal - descontoReais);

  const adicionar = useCallback((peca: Peca) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.peca_id === peca.id);
      if (existe) {
        if (existe.quantidade >= peca.estoque_atual) return prev;
        return prev.map((i) => i.peca_id === peca.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { peca_id: peca.id, nome: peca.nome, codigo: peca.codigo, valor_unitario: peca.preco_venda, quantidade: 1, estoque_max: peca.estoque_atual }];
    });
  }, []);

  const alterarQtd = useCallback((pecaId: string, qtd: number) => {
    setItens((prev) => prev.map((i) => i.peca_id === pecaId ? { ...i, quantidade: qtd } : i));
  }, []);

  const remover = useCallback((pecaId: string) => {
    setItens((prev) => prev.filter((i) => i.peca_id !== pecaId));
  }, []);

  const confirmarPagamento = async (clienteId: string | null, forma: FormaPagamento, parcelas: number) => {
    await criarVenda.mutateAsync({
      cliente_id: clienteId,
      itens: itens.map((i) => ({ peca_id: i.peca_id, quantidade: i.quantidade, valor_unitario: i.valor_unitario })),
      desconto: descontoReais, forma_pagamento: forma, parcelas, valor_total: total,
    });
    toast.success('Venda registrada com sucesso!');
    setItens([]); setDesconto(0); setPagamentoOpen(false);
  };

  if (caixaLoading) return <AppLayout><LoadingState /></AppLayout>;

  if (!caixaAberto) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="rounded-full bg-muted p-5">
            <Lock className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Abra o caixa para começar a vender</h2>
          <p className="text-muted-foreground max-w-sm">
            Antes de registrar vendas, é necessário abrir o caixa do dia no módulo Financeiro.
          </p>
          <Button size="lg" className="h-12 gap-2 mt-2" onClick={() => navigate('/financeiro')}>
            Abrir Caixa <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <PDVLayout carrinhoCount={itens.length}
        produtosPanel={<PDVBuscaProduto onAdicionar={adicionar} />}
        historicoPanel={<PDVHistorico />}
        carrinhoPanel={
          <PDVCarrinho itens={itens} onAlterarQtd={alterarQtd} onRemover={remover}
            subtotal={subtotal} desconto={desconto} tipoDesconto={tipoDesconto}
            onDescontoChange={setDesconto} onTipoDescontoChange={setTipoDesconto}
            total={total} onFechar={() => setPagamentoOpen(true)} loading={criarVenda.isPending} />
        }
      />
      <PDVPagamentoDialog open={pagamentoOpen} total={total}
        onClose={() => setPagamentoOpen(false)} onConfirmar={confirmarPagamento} loading={criarVenda.isPending} />
    </>
  );
}
