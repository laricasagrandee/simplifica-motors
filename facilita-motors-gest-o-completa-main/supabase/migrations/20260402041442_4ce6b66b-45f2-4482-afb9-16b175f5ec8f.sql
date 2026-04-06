CREATE TABLE public.os_pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  forma_pagamento text NOT NULL,
  valor numeric(12,2) NOT NULL,
  parcelas integer DEFAULT 1,
  valor_recebido numeric(12,2),
  troco numeric(12,2) DEFAULT 0,
  observacao text,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_os_pagamentos_os_id ON public.os_pagamentos(os_id);

ALTER TABLE public.os_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_full" ON public.os_pagamentos
  FOR ALL TO public
  USING (auth.role() = 'authenticated'::text)
  WITH CHECK (auth.role() = 'authenticated'::text);