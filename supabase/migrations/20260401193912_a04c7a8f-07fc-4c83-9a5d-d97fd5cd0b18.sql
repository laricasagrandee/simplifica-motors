CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  acao text NOT NULL,
  tabela text NOT NULL,
  registro_id uuid,
  dados_antes jsonb,
  dados_depois jsonb,
  ip text,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_audit_log_tabela ON public.audit_log(tabela);
CREATE INDEX idx_audit_log_criado_em ON public.audit_log(criado_em);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full" ON public.audit_log FOR ALL USING (auth.role() = 'authenticated');