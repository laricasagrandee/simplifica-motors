-- Remove ALL movimentacoes for OS-7, then re-insert only the correct ones
DELETE FROM public.movimentacoes 
WHERE os_id = 'fff5cc99-99a8-4726-b296-bbea0d68aa26';

-- Re-insert correct movimentacoes: 1x PIX R$223 + 1x Cartão Crédito R$221 + 3 parcelas
INSERT INTO public.movimentacoes (tipo, categoria, descricao, valor, forma_pagamento, os_id, data, pago)
VALUES 
  ('entrada', 'os_pagamento', 'OS-7 · PIX', 223.00, 'pix', 'fff5cc99-99a8-4726-b296-bbea0d68aa26', '2026-04-02', true),
  ('entrada', 'os_pagamento', 'OS-7 · Cartão Crédito', 221.00, 'cartao_credito', 'fff5cc99-99a8-4726-b296-bbea0d68aa26', '2026-04-02', false);

INSERT INTO public.movimentacoes (tipo, categoria, descricao, valor, forma_pagamento, os_id, data, pago, data_vencimento)
VALUES
  ('entrada', 'os_parcela', 'OS-7 parcela 1/3', 73.67, 'cartao_credito', 'fff5cc99-99a8-4726-b296-bbea0d68aa26', '2026-04-02', false, '2026-05-02'),
  ('entrada', 'os_parcela', 'OS-7 parcela 2/3', 73.67, 'cartao_credito', 'fff5cc99-99a8-4726-b296-bbea0d68aa26', '2026-04-02', false, '2026-06-01'),
  ('entrada', 'os_parcela', 'OS-7 parcela 3/3', 73.67, 'cartao_credito', 'fff5cc99-99a8-4726-b296-bbea0d68aa26', '2026-04-02', false, '2026-07-01');