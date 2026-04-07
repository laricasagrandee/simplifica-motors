import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/lib/sanitize';
import { useTenantId } from '@/hooks/useTenantId';
import { wt } from '@/lib/tenantHelper';
import type { OSFoto } from '@/types/database';

export function useFotosPorOS(osId: string) {
  return useQuery<OSFoto[]>({
    queryKey: ['os-fotos', osId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_fotos')
        .select('*')
        .eq('os_id', osId)
        .order('criado_em');
      if (error) throw error;
      return (data ?? []) as unknown as OSFoto[];
    },
    enabled: !!osId,
  });
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_W = 1200;
      let w = img.width, h = img.height;
      if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(new File([blob!], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function useUploadFoto() {
  const qc = useQueryClient();
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: async ({ osId, file, categoria, descricao }: { osId: string; file: File; categoria: 'entrada' | 'durante' | 'saida' | 'recusa'; descricao?: string }) => {
      const compressed = await compressImage(file);
      const path = `${osId}/${categoria}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from('os-fotos').upload(path, compressed);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('os-fotos').getPublicUrl(path);
      const { error } = await supabase.from('os_fotos').insert(wt({
        os_id: osId,
        tipo: categoria === 'saida' ? 'saida' : 'entrada',
        categoria,
        descricao: descricao ? sanitizeInput(descricao, 200) : null,
        url: urlData.publicUrl,
      }, tenantId));
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['os-fotos', v.osId] }),
  });
}

export function useRemoverFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, osId, url }: { id: string; osId: string; url: string }) => {
      const { error } = await supabase.from('os_fotos').delete().eq('id', id);
      if (error) throw error;
      try {
        const path = new URL(url).pathname.split('/os-fotos/')[1];
        if (path) await supabase.storage.from('os-fotos').remove([path]);
      } catch { /* ignore storage errors */ }
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['os-fotos', v.osId] }),
  });
}
