
-- 1. Remover a movimentação PIX duplicada da OS-6 (manter apenas a mais recente)
DELETE FROM public.movimentacoes 
WHERE id = '34934134-48fb-418f-80b9-b72d09c2a4f8';

-- 2. Marcar cartão crédito parcelado como NÃO pago (pendente) - OS-6
UPDATE public.movimentacoes 
SET pago = false 
WHERE id = '22c6069a-0bcc-4016-b605-94d018de8413';

-- 3. Marcar cartão crédito parcelado como NÃO pago (pendente) - OS-7
UPDATE public.movimentacoes 
SET pago = false 
WHERE id = '07596fdd-262d-40d0-8029-ca81acf3a2bb';

-- 4. Recalcular caixa de hoje com valores corretos
-- Pagamentos à vista (pago=true): OS-3 PIX 219 + OS-4 Dinheiro 230 + OS-6 PIX 55 + OS-7 PIX 223 = 727
UPDATE public.caixa 
SET total_entradas = 727.00 
WHERE id = 'a492cb5c-a040-46e2-a77e-f8ee777d4734';
