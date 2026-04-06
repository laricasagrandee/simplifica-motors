ALTER TABLE public.configuracoes
  ADD COLUMN taxa_cartao_debito numeric DEFAULT 1.99,
  ADD COLUMN taxa_cartao_credito numeric DEFAULT 3.49,
  ADD COLUMN taxa_cartao_credito_parcelado numeric DEFAULT 4.99;