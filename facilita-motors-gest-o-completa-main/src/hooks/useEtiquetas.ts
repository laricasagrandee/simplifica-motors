import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import type { Peca } from '@/types/database';

async function gerarQRDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

export function useGerarQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (peca: Peca) => {
      const data = JSON.stringify({ id: peca.id, codigo: peca.codigo, nome: peca.nome });
      const url = await gerarQRDataUrl(data);
      await supabase.from('pecas').update({ qr_code_url: url }).eq('id', peca.id);
      return url;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pecas'] }); toast({ title: 'QR Code gerado!' }); },
  });
}

export function useGerarEtiquetasLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pecas: Peca[]) => {
      const results: { peca: Peca; qr: string }[] = [];
      for (const peca of pecas) {
        const data = JSON.stringify({ id: peca.id, codigo: peca.codigo, nome: peca.nome });
        const url = await gerarQRDataUrl(data);
        await supabase.from('pecas').update({ qr_code_url: url }).eq('id', peca.id);
        results.push({ peca, qr: url });
      }
      return results;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pecas'] }); toast({ title: 'Etiquetas geradas!' }); },
  });
}

export function gerarQRCodeOS(osId: string): Promise<string> {
  const url = window.location.origin + '/os/' + osId;
  return gerarQRDataUrl(url);
}
