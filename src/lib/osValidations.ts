import type { OrdemServico, OSItem, StatusOS } from '@/types/database';

interface ValidacaoResult {
  valido: boolean;
  mensagem: string;
}

export function validarTransicaoOS(
  os: OrdemServico,
  itens: OSItem[],
  novoStatus: StatusOS
): ValidacaoResult {
  const ok: ValidacaoResult = { valido: true, mensagem: '' };

  if (novoStatus === 'cancelada') return ok;

  switch (os.status) {
    case 'aberta':
      if (novoStatus === 'em_orcamento') return ok;
      break;

    case 'em_orcamento':
      if (novoStatus === 'aprovada') {
        if (itens.length === 0) {
          return { valido: false, mensagem: 'Adicione pelo menos uma peça ou serviço ao orçamento' };
        }
        return ok;
      }
      break;

    case 'aprovada':
      if (novoStatus === 'em_execucao') return ok;
      break;

    case 'em_execucao':
      if (novoStatus === 'concluida') return ok;
      break;

    case 'concluida':
      if (novoStatus === 'entregue') {
        if (!os.forma_pagamento) {
          return { valido: false, mensagem: 'Registre o pagamento antes de entregar o veículo' };
        }
        return ok;
      }
      break;
  }

  return { valido: false, mensagem: `Transição de "${os.status}" para "${novoStatus}" não permitida` };
}
