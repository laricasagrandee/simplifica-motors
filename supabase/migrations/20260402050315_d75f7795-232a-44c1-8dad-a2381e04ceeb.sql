ALTER TABLE public.movimentacoes DROP CONSTRAINT IF EXISTS movimentacoes_categoria_check;

ALTER TABLE public.movimentacoes
ADD CONSTRAINT movimentacoes_categoria_check
CHECK (
  (categoria)::text = ANY (
    ARRAY[
      'os_pagamento'::character varying,
      'os_parcela'::character varying,
      'venda_pdv'::character varying,
      'venda_avulsa'::character varying,
      'compra_pecas'::character varying,
      'despesa_aluguel'::character varying,
      'despesa_energia'::character varying,
      'despesa_agua'::character varying,
      'despesa_internet'::character varying,
      'despesa_oficina'::character varying,
      'salario'::character varying,
      'comissao'::character varying,
      'imposto'::character varying,
      'outros'::character varying
    ]::text[]
  )
);