CREATE TABLE public.inventarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date DEFAULT current_date,
  status text DEFAULT 'em_andamento',
  observacoes text,
  criado_por uuid REFERENCES public.funcionarios(id),
  criado_em timestamp with time zone DEFAULT now(),
  finalizado_em timestamp with time zone
);

ALTER TABLE public.inventarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full" ON public.inventarios FOR ALL USING (auth.role() = 'authenticated');

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validar_inventario_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('em_andamento', 'finalizado') THEN
    RAISE EXCEPTION 'Status de inventário inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_inventario_status
BEFORE INSERT OR UPDATE ON public.inventarios
FOR EACH ROW EXECUTE FUNCTION public.validar_inventario_status();

CREATE TABLE public.inventario_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id uuid REFERENCES public.inventarios(id) ON DELETE CASCADE NOT NULL,
  peca_id uuid REFERENCES public.pecas(id) NOT NULL,
  estoque_sistema integer NOT NULL,
  estoque_contado integer,
  diferenca integer GENERATED ALWAYS AS (COALESCE(estoque_contado, 0) - estoque_sistema) STORED,
  observacao text,
  contado_em timestamp with time zone
);

ALTER TABLE public.inventario_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full" ON public.inventario_itens FOR ALL USING (auth.role() = 'authenticated');