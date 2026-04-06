import { useCaixaHoje, useAbrirCaixa } from '@/hooks/useCaixa';

export function useCaixaStatus() {
  const { data: caixa, isLoading } = useCaixaHoje();
  const abrirCaixa = useAbrirCaixa();

  const caixaAberto = !!caixa && caixa.status === 'aberto';
  const saldoAtual = caixaAberto
    ? (caixa.saldo_abertura ?? 0) + (caixa.total_entradas ?? 0) - (caixa.total_saidas ?? 0)
    : 0;

  const abrirCaixaRapido = async () => {
    abrirCaixa.mutate(0);
  };

  return {
    caixa,
    caixaAberto,
    saldoAtual,
    totalEntradas: caixa?.total_entradas ?? 0,
    totalSaidas: caixa?.total_saidas ?? 0,
    loading: isLoading,
    abrirCaixaRapido,
    abrindoCaixa: abrirCaixa.isPending,
  };
}
