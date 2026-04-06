CREATE OR REPLACE FUNCTION public.validar_agendamento_status()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('agendado','confirmado','cancelado','concluido') THEN
    RAISE EXCEPTION 'Status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;