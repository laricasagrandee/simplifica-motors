ALTER TABLE public.ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_forma_pagamento_check;

ALTER TABLE public.ordens_servico
ADD CONSTRAINT ordens_servico_forma_pagamento_check
CHECK (
  (forma_pagamento)::text = ANY (
    ARRAY[
      'dinheiro'::character varying,
      'pix'::character varying,
      'cartao_debito'::character varying,
      'cartao_credito'::character varying,
      'boleto'::character varying,
      'multiplo'::character varying
    ]::text[]
  )
);