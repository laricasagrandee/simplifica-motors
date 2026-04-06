import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Search, PackagePlus } from 'lucide-react';
import { useListarPecas } from '@/hooks/usePecas';
import { formatarMoeda } from '@/lib/formatters';
import type { Peca } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdicionar: (data: { pecaId?: string; descricao: string; quantidade: number; valorUnitario: number }) => Promise<void>;
  loading: boolean;
}

export function AddPecaDialog({ open, onClose, onAdicionar, loading }: Props) {
  const [busca, setBusca] = useState('');
  const [peca, setPeca] = useState<Peca | null>(null);
  const [avulsa, setAvulsa] = useState(false);
  const [qty, setQty] = useState('1');
  const [valor, setValor] = useState('');
  const [nomeAvulso, setNomeAvulso] = useState('');

  const { data } = useListarPecas(busca, '', false, 1);
  const pecas = data?.data ?? [];
  const total = (parseInt(qty) || 0) * (parseFloat(valor) || 0);

  const handleSelect = (p: Peca) => { setPeca(p); setValor(String(p.preco_venda)); setBusca(''); setAvulsa(false); };

  const handleSubmit = async () => {
    if (avulsa) {
      if (!nomeAvulso.trim()) return;
      await onAdicionar({ descricao: nomeAvulso.trim(), quantidade: parseInt(qty) || 1, valorUnitario: parseFloat(valor) || 0 });
    } else {
      if (!peca) return;
      await onAdicionar({ pecaId: peca.id, descricao: `${peca.nome}${peca.codigo ? ` (${peca.codigo})` : ''}`, quantidade: parseInt(qty) || 1, valorUnitario: parseFloat(valor) || 0 });
    }
    setPeca(null); setQty('1'); setValor(''); setNomeAvulso(''); setAvulsa(false); onClose();
  };

  const resetToSearch = () => { setPeca(null); setAvulsa(false); setNomeAvulso(''); setQty('1'); setValor(''); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetToSearch(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display">Adicionar Peça</DialogTitle></DialogHeader>
        {!peca && !avulsa ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar peça..." className="pl-10 min-h-[44px]" />
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-border border border-border rounded-lg">
              {pecas.map((p) => (
                <button key={p.id} onClick={() => handleSelect(p)} className="w-full flex justify-between p-3 hover:bg-muted/30 text-left min-h-[44px]">
                  <div><p className="text-sm font-medium">{p.nome}</p>{p.codigo && <p className="text-xs font-mono text-muted-foreground">{p.codigo}</p>}</div>
                  <div className="text-right"><p className="text-sm font-mono">{formatarMoeda(p.preco_venda)}</p><p className="text-xs text-muted-foreground">Est: {p.estoque_atual}</p></div>
                </button>
              ))}
            </div>
            <button onClick={() => setAvulsa(true)} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              <PackagePlus className="h-3.5 w-3.5" /> Adicionar peça avulsa (sem estoque)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {avulsa ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Nome da peça</Label>
                <Input value={nomeAvulso} onChange={(e) => setNomeAvulso(e.target.value)} placeholder="Ex: Correia dentada..." className="min-h-[44px]" maxLength={200} />
              </div>
            ) : peca && (
              <div className="bg-accent-light rounded-lg p-3">
                <p className="font-medium text-sm">{peca.nome}</p>
                <p className="text-xs text-muted-foreground">Estoque: {peca.estoque_atual} {peca.unidade}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Quantidade</Label>
                <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="min-h-[44px]" />
                {peca && parseInt(qty) > (peca.estoque_atual ?? 0) && <p className="text-xs text-danger">Acima do estoque!</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Valor Unit. (R$)</Label>
                <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="min-h-[44px]" />
              </div>
            </div>
            <p className="text-right font-mono font-medium">Total: {formatarMoeda(total)}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetToSearch}>Voltar</Button>
              <Button onClick={handleSubmit} disabled={loading || (avulsa && !nomeAvulso.trim())}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
