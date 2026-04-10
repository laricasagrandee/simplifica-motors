import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useListarNF, useCriarNF, useOSParaNF } from '@/hooks/useNF';
import { useNFCompleta } from '@/hooks/useNFCompleta';
import { NFList } from '@/components/nf/NFList';
import { NFForm } from '@/components/nf/NFForm';
import { NFPreview } from '@/components/nf/NFPreview';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function NFPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const osIdParam = searchParams.get('os_id');
  const [formOpen, setFormOpen] = useState(false);
  const [previewId, setPreviewId] = useState('');
  const [printId, setPrintId] = useState('');
  const nfs = useListarNF();
  const criar = useCriarNF();
  const osDraft = useOSParaNF(osIdParam);
  const nfCompleta = useNFCompleta(previewId);

  useEffect(() => {
    if (printId && printId === previewId && nfCompleta.data) {
      const timer = setTimeout(() => {
        window.print();
        setPrintId('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printId, previewId, nfCompleta.data]);

  useEffect(() => {
    if (osIdParam && osDraft.data) setFormOpen(true);
  }, [osIdParam, osDraft.data]);

  const { data: clientes } = useQuery({
    queryKey: ['clientes-nf-select'],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('id, nome, cpf_cnpj').order('nome');
      return data || [];
    },
  });

  const handleClose = () => {
    setFormOpen(false);
    if (osIdParam) setSearchParams({});
  };

  return (
    <AppLayout>
      <PageHeader titulo="Comprovantes" subtitulo="Emissão e consulta">
        <Button onClick={() => setFormOpen(true)} className="bg-accent text-accent-foreground min-h-[44px] gap-2">
          <Plus className="h-4 w-4" />Novo Comprovante
        </Button>
      </PageHeader>
      <NFList
        notas={nfs.data?.notas as unknown as Parameters<typeof NFList>[0]['notas'] || []}
        loading={nfs.isLoading}
        onVer={id => setPreviewId(id)}
        onImprimir={id => { setPreviewId(id); setPrintId(id); }}
      />
      <NFForm
        open={formOpen}
        onClose={handleClose}
        clientes={clientes || []}
        onEmitir={d => criar.mutate(d)}
        osDraft={osDraft.data ?? undefined}
      />
      <Dialog open={!!previewId} onOpenChange={v => !v && setPreviewId('')}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {nfCompleta.isLoading && <Skeleton className="h-96" />}
          {nfCompleta.data && <NFPreview nf={nfCompleta.data} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
