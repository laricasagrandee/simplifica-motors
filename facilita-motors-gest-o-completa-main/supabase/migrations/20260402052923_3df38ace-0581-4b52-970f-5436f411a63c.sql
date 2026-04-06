-- Remove parcelas separadas da OS-7
DELETE FROM public.movimentacoes 
WHERE os_id = 'fff5cc99-99a8-4726-b296-bbea0d68aa26' 
  AND categoria = 'os_parcela';

-- Atualizar descrição do cartão para incluir 3x
UPDATE public.movimentacoes 
SET descricao = 'OS-7 · Cartão Crédito 3x', total_parcelas = 3
WHERE os_id = 'fff5cc99-99a8-4726-b296-bbea0d68aa26' 
  AND forma_pagamento = 'cartao_credito';