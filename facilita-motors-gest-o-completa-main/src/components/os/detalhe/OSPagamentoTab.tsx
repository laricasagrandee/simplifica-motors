import { useCaixaHoje } from '@/hooks/useCaixa';
import { useItensPorOS } from '@/hooks/useOSItens';
import {
  usePagamentosOS, useAdicionarPagamento,
  useRemoverPagamento, useFinalizarPagamento,
} from '@/hooks/useOSPagamentos';
import { CaixaInlineOpener } from './pagamento/CaixaInlineOpener';
import { CaixaStatusBanner } from './pagamento/CaixaStatusBanner';
import { PagamentoResumoOS } from './pagamento/PagamentoResumoOS';
import { PagamentoEntradaForm } from './pagamento/PagamentoEntradaForm';
import { PagamentosLista } from './pagamento/PagamentosLista';
import { BotaoFinalizarPagamento } from './pagamento/BotaoFinalizarPagamento';
import { PagamentoConfirmado } from './pagamento/PagamentoConfirmado';
import { toast } from 'sonner';
import { formatarMoeda } from '@/lib/formatters';
import type { OrdemServico, OSPagamento } from '@/types/database';

interface Props {
  os: OrdemServico;
  onMudarStatus?: (status: string) => Promise<void>;
}

export function OSPagamentoTab({ os, onMudarStatus }: Props) {
  const { data: caixa, isLoading: caixaLoading } = useCaixaHoje();
  const { data: itens } = useItensPorOS(os.id);

  const total = Number(os.valor_total) || 0;
  const { data: pagamentos = [], totalPago, restante } = usePagamentosOS(os.id, total);

  const addPagamento = useAdicionarPagamento();
  const removePagamento = useRemoverPagamento();
  const finalizar = useFinalizarPagamento();

  // OS já paga
  if (os.forma_pagamento) {
    return <PagamentoConfirmado os={os} onMudarStatus={onMudarStatus} />;
  }

  const caixaAberto = !!caixa && caixa.status === 'aberto';

  const handleFinalizar = () => {
    if (!caixaAberto) {
      toast.error('Abra o caixa antes de confirmar');
      return;
    }
    if (restante > 0.01) {
      toast.error(`Ainda faltam ${formatarMoeda(restante)}`);
      return;
    }
    finalizar.mutate({
      osId: os.id,
      osNumero: os.numero,
      valorTotal: total,
      pagamentos: pagamentos as OSPagamento[],
    });
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Status do caixa */}
      {!caixaLoading && !caixaAberto ? (
        <CaixaInlineOpener />
      ) : (
        <CaixaStatusBanner caixa={caixa ?? null} caixaLoading={caixaLoading} />
      )}

      {/* Resumo da OS */}
      <PagamentoResumoOS os={os} itens={itens ?? []} />

      {/* Formulário para adicionar pagamento */}
      {restante > 0.01 && (
        <PagamentoEntradaForm
          valorRestante={restante}
          loading={addPagamento.isPending}
          onAdicionar={(pag) =>
            addPagamento.mutate({
              osId: os.id,
              forma: pag.forma_pagamento,
              valor: pag.valor,
              parcelas: pag.parcelas,
              valorRecebido: pag.valor_recebido ?? undefined,
            })
          }
        />
      )}

      {/* Lista de pagamentos adicionados */}
      {pagamentos.length > 0 && (
        <PagamentosLista
          pagamentos={pagamentos as OSPagamento[]}
          valorTotal={total}
          onRemover={(id) => removePagamento.mutate({ id, osId: os.id })}
          loading={removePagamento.isPending}
        />
      )}

      {/* Botão de confirmação final */}
      {pagamentos.length > 0 && (
        <BotaoFinalizarPagamento
          valorTotal={total}
          totalPago={totalPago}
          onFinalizar={handleFinalizar}
          loading={finalizar.isPending}
        />
      )}
    </div>
  );
}
