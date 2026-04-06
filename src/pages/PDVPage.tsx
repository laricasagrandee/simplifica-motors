import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PDVLayout } from '@/components/pdv/PDVLayout';
import { PDVBuscaProduto } from '@/components/pdv/PDVBuscaProduto';
import { PDVCarrinho } from '@/components/pdv/PDVCarrinho';
import { PDVPagamentoDialog } from '@/components/pdv/PDVPagamentoDialog';
import { PDVHistorico } from '@/components/pdv/PDVHistorico';
import { CaixaInlineOpener } from '@/components/os/detalhe/pagamento/CaixaInlineOpener';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCriarVenda } from '@/hooks/usePDV';
import { useCaixaHoje } from '@/hooks/useCaixa';
import type { CarrinhoItem } from '@/components/pdv/PDVCarrinhoItem';
import type { Peca, FormaPagamento } from '@/types/database';

export default function PDVPage() {
  const { data: caixa, isLoading: caixaLoading, refetch } = useCaixaHoje();
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

  const adicionarAvulso = useCallback((item: { nome: string; valor: number }) => {
    const avulsoId = `avulso-${Date.now()}`;
    setItens((prev) => [...prev, {
      peca_id: avulsoId,
      nome: item.nome,
      codigo: null,
      valor_unitario: item.valor,
      quantidade: 1,
      estoque_max: 9999,
    }]);
    toast.success('Item avulso adicionado!');
  }, []);

  const alterarQtd = useCallback((pecaId: string, qtd: number) => {
    setItens((prev) => prev.map((i) => i.peca_id === pecaId ? { ...i, quantidade: qtd } : i));
  }, []);

  const remover = useCallback((pecaId: string) => {
    setItens((prev) => prev.filter((i) => i.peca_id !== pecaId));
  }, []);

  const confirmarPagamento = async (clienteId: string | null, forma: FormaPagamento, parcelas: number) => {
    const itensReais = itens.filter(i => !i.peca_id.startsWith('avulso-'));
    const itensAvulsos = itens.filter(i => i.peca_id.startsWith('avulso-'));
    
    await criarVenda.mutateAsync({
      cliente_id: clienteId,
      itens: itensReais.map((i) => ({ peca_id: i.peca_id, quantidade: i.quantidade, valor_unitario: i.valor_unitario })),
      desconto: descontoReais, forma_pagamento: forma, parcelas, valor_total: total,
      observacao: itensAvulsos.length > 0 ? `Itens avulsos: ${itensAvulsos.map(i => `${i.nome} R$${i.valor_unitario}`).join(', ')}` : undefined,
    });
    toast.success('Venda registrada com sucesso!');
    setItens([]); setDesconto(0); setPagamentoOpen(false);
  };

  if (caixaLoading) return <AppLayout><LoadingState /></AppLayout>;

  return (
    <>
      <PDVLayout carrinhoCount={itens.length}
        produtosPanel={
          <div className="space-y-3">
            {!caixaAberto && (
              <CaixaInlineOpener onAberto={() => refetch()} />
            )}
            <PDVBuscaProduto onAdicionar={adicionar} onAdicionarAvulso={adicionarAvulso} />
          </div>
        }
        historicoPanel={<PDVHistorico />}
        carrinhoPanel={
          <PDVCarrinho itens={itens} onAlterarQtd={alterarQtd} onRemover={remover}
            subtotal={subtotal} desconto={desconto} tipoDesconto={tipoDesconto}
            onDescontoChange={setDesconto} onTipoDescontoChange={setTipoDesconto}
            total={total} onFechar={() => {
              if (!caixaAberto) { toast.error('Abra o caixa antes de finalizar a venda'); return; }
              setPagamentoOpen(true);
            }} loading={criarVenda.isPending} />
        }
      />
      <PDVPagamentoDialog open={pagamentoOpen} total={total}
        onClose={() => setPagamentoOpen(false)} onConfirmar={confirmarPagamento} loading={criarVenda.isPending} />
    </>
  );
}
