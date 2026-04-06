CREATE TABLE public.metas_mecanico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid REFERENCES public.funcionarios(id) NOT NULL,
  mes integer NOT NULL,
  ano integer NOT NULL,
  meta_os integer DEFAULT 0,
  meta_faturamento numeric(12,2) DEFAULT 0,
  criado_em timestamp with time zone DEFAULT now(),
  UNIQUE(funcionario_id, mes, ano)
);

ALTER TABLE public.metas_mecanico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full" ON public.metas_mecanico FOR ALL USING (auth.role() = 'authenticated');