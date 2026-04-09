import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { PecaResumo } from '@/components/pecas/PecaResumo';
import { PecaFiltros } from '@/components/pecas/PecaFiltros';
import { PecaList } from '@/components/pecas/PecaList';
import { PecaForm } from '@/components/pecas/PecaForm';
import { EntradaEstoqueForm } from '@/components/pecas/EntradaEstoqueForm';
import { EtiquetaSelecao } from '@/components/pecas/EtiquetaSelecao';
import { QRCodeScanner } from '@/components/pecas/QRCodeScanner';
import { InventarioDialog } from '@/components/pecas/InventarioDialog';
import { GerenciarCategoriasDialog } from '@/components/pecas/GerenciarCategoriasDialog';
import { ClientePagination } from '@/components/clientes/ClientePagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, PackagePlus, QrCode, ScanLine, ClipboardList, Tags } from 'lucide-react';
import { useListarPecas, useCriarPeca, useEditarPeca, useResumoPecas } from '@/hooks/usePecas';
import { useEntradaEstoque } from '@/hooks/useEstoque';
import { useGerarEtiquetasLote } from '@/hooks/useEtiquetas';
import { useInventarioAtual, useCriarInventario } from '@/hooks/useInventario';
import type { Peca, CategoriaPeca } from '@/types/database';

export default function PecasPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [apenasAlerta, setApenasAlerta] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Peca | null>(null);
  const [entradaPeca, setEntradaPeca] = useState<Peca | null>(null);
  const [etiquetasOpen, setEtiquetasOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [inventarioOpen, setInventarioOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const cat = categoria === 'all' ? '' : categoria;
  const { data, isLoading } = useListarPecas(busca, cat as CategoriaPeca | '', apenasAlerta, pagina);
  const { data: resumo } = useResumoPecas();
  const criar = useCriarPeca();
  const editar = useEditarPeca();
  const entrada = useEntradaEstoque();
  const gerarEtiquetas = useGerarEtiquetasLote();
  const { data: invAtual } = useInventarioAtual();
  const criarInv = useCriarInventario();

  const handleInventario = async () => {
    if (invAtual) {
      setInventarioOpen(true);
    } else {
      const inv = await criarInv.mutateAsync();
      if (inv) setInventarioOpen(true);
    }
  };

  const handleSalvar = async (d: Record<string, string | number | null>) => {
    if (d.id) await editar.mutateAsync(d as Parameters<typeof editar.mutateAsync>[0]);
    else await criar.mutateAsync(d);
  };

  const handleScan = (raw: string) => {
    setScannerOpen(false);
    // Try parsing as JSON (peça QR)
    try {
      const parsed = JSON.parse(raw);
      if (parsed.id) {
        const peca = data?.data.find((p) => p.id === parsed.id);
        if (peca) {
          setEditando(peca);
          setFormOpen(true);
          return;
        }
      }
    } catch {
      // Not JSON — check if it's an OS URL
    }
    // Check if it's an OS URL
    if (raw.includes('/os/')) {
      const osId = raw.split('/os/').pop();
      if (osId) { navigate(`/os/${osId}`); return; }
    }
  };

  return (
    <AppLayout>
      <PageHeader titulo="Peças & Produtos" subtitulo="Catálogo e controle de estoque">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setCategoriasOpen(true)} className="gap-2 min-h-[44px]">
            <Tags className="h-4 w-4" /> <span className="hidden sm:inline">Categorias</span>
          </Button>
          <Button variant="outline" onClick={handleInventario} disabled={criarInv.isPending} className="gap-2 min-h-[44px]">
            <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">Inventário</span>
          </Button>
          <Button variant="outline" onClick={() => setScannerOpen(true)} className="gap-2 min-h-[44px]">
            <ScanLine className="h-4 w-4" /> <span className="hidden sm:inline">Escanear QR</span>
          </Button>
          <Button variant="outline" onClick={() => setEtiquetasOpen(true)} className="gap-2 min-h-[44px]">
            <QrCode className="h-4 w-4" /> <span className="hidden sm:inline">Etiquetas QR</span>
          </Button>
          <Button variant="outline" onClick={() => setEntradaPeca({} as Peca)} className="gap-2 min-h-[44px]">
            <PackagePlus className="h-4 w-4" /> <span className="hidden sm:inline">Entrada</span>
          </Button>
          <Button onClick={() => { setEditando(null); setFormOpen(true); }} className="gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" /> Nova Peça
          </Button>
        </div>
      </PageHeader>
      {resumo && <PecaResumo totalPecas={resumo.totalPecas} valorEstoque={resumo.valorEstoque} qtdAlerta={resumo.qtdAlerta} />}
      <PecaFiltros busca={busca} categoria={categoria || 'all'} apenasAlerta={apenasAlerta}
        onBuscaChange={(v) => { setBusca(v); setPagina(1); }}
        onCategoriaChange={(v) => { setCategoria(v); setPagina(1); }}
        onAlertaChange={(v) => { setApenasAlerta(v); setPagina(1); }}
      />
      <PecaList pecas={data?.data ?? []} loading={isLoading}
        onEditar={(p) => { setEditando(p); setFormOpen(true); }}
        onVer={(id) => { const p = data?.data.find((x) => x.id === id); if (p) { setEditando(p); setFormOpen(true); } }}
        onNova={() => { setEditando(null); setFormOpen(true); }}
      />
      <ClientePagination pagina={pagina} total={data?.total ?? 0} porPagina={15} onChange={setPagina} />
      <PecaForm open={formOpen} onClose={() => setFormOpen(false)} peca={editando} onSalvar={handleSalvar} loading={criar.isPending || editar.isPending} />
      <EntradaEstoqueForm open={!!entradaPeca?.id} onClose={() => setEntradaPeca(null)} peca={entradaPeca}
        onSalvar={async (d) => { await entrada.mutateAsync(d); }} loading={entrada.isPending}
      />
      <EtiquetaSelecao open={etiquetasOpen} onClose={() => setEtiquetasOpen(false)} pecas={data?.data ?? []} onGerar={pecas => gerarEtiquetas.mutate(pecas)} />
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR Code</DialogTitle>
          </DialogHeader>
          {scannerOpen && <QRCodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}
        </DialogContent>
      </Dialog>
      {invAtual && <InventarioDialog open={inventarioOpen} onClose={() => setInventarioOpen(false)} inventario={invAtual} />}
      <GerenciarCategoriasDialog open={categoriasOpen} onClose={() => setCategoriasOpen(false)} />
    </AppLayout>
  );
}
