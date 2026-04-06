import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { EtiquetasPrintPage } from './EtiquetasPrintPage';
import type { Peca } from '@/types/database';

interface Props { open: boolean; onClose: () => void; pecas: Peca[]; onGerar: (ids: Peca[]) => void; }

export function EtiquetaSelecao({ open, onClose, pecas, onGerar }: Props) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');
  const [mostraPrint, setMostraPrint] = useState(false);

  const filtradas = pecas.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo?.toLowerCase().includes(busca.toLowerCase()));
  const toggle = (id: string) => { const s = new Set(selecionadas); s.has(id) ? s.delete(id) : s.add(id); setSelecionadas(s); };
  const toggleTodas = () => setSelecionadas(selecionadas.size === filtradas.length ? new Set() : new Set(filtradas.map(p => p.id)));
  const selecionadasList = pecas.filter(p => selecionadas.has(p.id));

  if (mostraPrint) {
    return (
      <Dialog open={open} onOpenChange={v => { if (!v) { setMostraPrint(false); onClose(); } }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Imprimir Etiquetas</DialogTitle></DialogHeader>
          <EtiquetasPrintPage pecas={selecionadasList} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Selecionar Peças para Etiquetas</DialogTitle></DialogHeader>
        <Input placeholder="Buscar peça..." value={busca} onChange={e => setBusca(e.target.value)} className="min-h-[44px] mb-3" />
        <div className="flex items-center gap-2 mb-2">
          <Checkbox checked={selecionadas.size === filtradas.length && filtradas.length > 0} onCheckedChange={toggleTodas} />
          <span className="text-sm">Selecionar todas ({filtradas.length})</span>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtradas.map(p => (
            <label key={p.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
              <Checkbox checked={selecionadas.has(p.id)} onCheckedChange={() => toggle(p.id)} />
              <span className="text-sm flex-1">{p.nome}</span>
              <span className="text-xs font-mono text-muted-foreground">{p.codigo}</span>
            </label>
          ))}
        </div>
        <Button onClick={() => { onGerar(selecionadasList); setMostraPrint(true); }} disabled={!selecionadas.size} className="w-full min-h-[44px] bg-accent text-accent-foreground mt-3">
          Gerar {selecionadas.size} Etiquetas
        </Button>
      </DialogContent>
    </Dialog>
  );
}
