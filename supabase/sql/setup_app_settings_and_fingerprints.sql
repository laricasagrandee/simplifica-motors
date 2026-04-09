-- ===========================================
-- 1. APP SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app_settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (true);

-- Default download URL
INSERT INTO public.app_settings (key, value)
VALUES ('download_desktop_url', 'https://drive.google.com/drive/folders/PLACEHOLDER')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- 2. DEVICE FINGERPRINTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL,
  device_type text NOT NULL DEFAULT 'unknown',
  machine_name text,
  email text,
  tenant_id uuid REFERENCES public.configuracoes(id) ON DELETE SET NULL,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_fp_fingerprint ON public.device_fingerprints (fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_fp_email ON public.device_fingerprints (email);

ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
-- No client policies — only service role (edge functions) can access
