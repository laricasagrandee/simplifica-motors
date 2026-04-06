ALTER TABLE public.movimentacoes 
  ADD COLUMN IF NOT EXISTS parcela_numero integer,
  ADD COLUMN IF NOT EXISTS total_parcelas integer;