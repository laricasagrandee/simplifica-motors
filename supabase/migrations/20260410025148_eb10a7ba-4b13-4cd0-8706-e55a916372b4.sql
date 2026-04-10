-- Adicionar campos Stripe na tabela configuracoes
ALTER TABLE public.configuracoes
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Criar tabela para preços dos planos (gerenciada pelo admin)
CREATE TABLE IF NOT EXISTS public.plano_precos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  intervalo text NOT NULL CHECK (intervalo IN ('mensal', 'anual')),
  valor_centavos integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  ativo boolean NOT NULL DEFAULT true,
  max_funcionarios integer NOT NULL DEFAULT 2,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(slug, intervalo)
);

-- Enable RLS
ALTER TABLE public.plano_precos ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler
CREATE POLICY "plano_precos_select" ON public.plano_precos
  FOR SELECT TO authenticated USING (true);

-- Inserir preços iniciais
INSERT INTO public.plano_precos (slug, intervalo, valor_centavos, stripe_price_id, max_funcionarios) VALUES
  ('basico', 'mensal', 8900, 'price_1TKV4xJLbzbjykwRa3SgjkrV', 3),
  ('basico', 'anual', 89000, 'price_1TKV6FJLbzbjykwRzkzQPdlk', 3),
  ('profissional', 'mensal', 14900, NULL, 10),
  ('profissional', 'anual', 149000, NULL, 10),
  ('premium', 'mensal', 24900, NULL, 999),
  ('premium', 'anual', 249000, NULL, 999)
ON CONFLICT (slug, intervalo) DO NOTHING;