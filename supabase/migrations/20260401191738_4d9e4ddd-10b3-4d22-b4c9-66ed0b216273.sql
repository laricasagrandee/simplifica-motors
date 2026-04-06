CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id),
  veiculo_id uuid REFERENCES public.motos(id),
  descricao text NOT NULL,
  data_hora timestamp with time zone NOT NULL,
  duracao_minutos integer DEFAULT 60,
  mecanico_id uuid REFERENCES public.funcionarios(id),
  status text DEFAULT 'agendado',
  os_id uuid REFERENCES public.ordens_servico(id),
  observacoes text,
  criado_em timestamp with time zone DEFAULT now()
);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validar_agendamento_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('agendado','confirmado','cancelado','concluido') THEN
    RAISE EXCEPTION 'Status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_agendamento_status
BEFORE INSERT OR UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.validar_agendamento_status();

-- RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_full" ON public.agendamentos
FOR ALL USING (auth.role() = 'authenticated');