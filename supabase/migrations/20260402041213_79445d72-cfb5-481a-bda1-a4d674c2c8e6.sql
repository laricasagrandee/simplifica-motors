-- Create storage bucket for configuracoes (logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('configuracoes', 'configuracoes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read configuracoes storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'configuracoes');

-- Allow authenticated users to upload/update logos
CREATE POLICY "Authenticated upload configuracoes storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'configuracoes');

CREATE POLICY "Authenticated update configuracoes storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'configuracoes');
