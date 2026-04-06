import { useState } from 'react';
import { Search, AlertTriangle, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useListarPecas, useCriarPeca } from '@/hooks/usePecas';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { toast } from 'sonner';
import type { Peca } from '@/types/database';

interface PDVBuscaProdutoProps {
  onAdicionar: (peca: Peca) => void;
  onAdicionarAvulso?: (item: { nome: string; valor: number }) => void;
}

export function PDVBuscaProduto({ onAdicionar, onAdicionarAvulso }: PDVBuscaProdutoProps) {
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useListarPecas(busca, '', false, 1);
  const pecas = data?.data ?? [];
  const [novaPecaOpen, setNovaPecaOpen] = useState(false);
  const [avulsaOpen, setAvulsaOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar peça por nome ou código..."
          className="pl-10 h-12 text-base"
        />
      </div>

      {isLoading && <LoadingState />}

      <div className="space-y-1">
        {pecas.map((peca) => (
          <PecaRow key={peca.id} peca={peca} onAdicionar={onAdicionar} />
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button onClick={() => setNovaPecaOpen(true)} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Cadastrar nova peça
        </button>
        {onAdicionarAvulso && (
          <button onClick={() => setAvulsaOpen(true)} className="text-sm text-muted-foreground font-medium hover:underline flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Venda avulsa (sem estoque)
          </button>
        )}
      </div>

      <NovaPecaRapidaDialog open={novaPecaOpen} onClose={() => setNovaPecaOpen(false)} onCriada={(p) => { onAdicionar(p); setNovaPecaOpen(false); }} />
      {onAdicionarAvulso && (
        <VendaAvulsaDialog open={avulsaOpen} onClose={() => setAvulsaOpen(false)} onConfirmar={(item) => { onAdicionarAvulso(item); setAvulsaOpen(false); }} />
      )}
    </div>
  );
}

function PecaRow({ peca, onAdicionar }: { peca: Peca; onAdicionar: (p: Peca) => void }) {
  const semEstoque = peca.estoque_atual <= 0;

  return (
    <button
      disabled={semEstoque}
      onClick={() => onAdicionar(peca)}
      className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-[hsl(var(--border-hover))] hover:bg-muted/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate">{peca.nome}</p>
        <p className="text-xs text-muted-foreground font-mono">{peca.codigo ?? '—'}</p>
      </div>
      <div className="flex items-center gap-4 ml-3 shrink-0">
        <div className="text-right">
          {semEstoque ? (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Sem estoque
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Est: {peca.estoque_atual}</span>
          )}
        </div>
        <MoneyDisplay valor={peca.preco_venda} className="text-sm" />
      </div>
    </button>
  );
}

function NovaPecaRapidaDialog({ open, onClose, onCriada }: { open: boolean; onClose: () => void; onCriada: (p: Peca) => void }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [qtd, setQtd] = useState('1');
  const criarPeca = useCriarPeca();

  const handleSalvar = async () => {
    if (!nome.trim() || !preco) return;
    try {
      const peca = await criarPeca.mutateAsync({
        nome: nome.trim(),
        preco_venda: parseFloat(preco),
        preco_custo: 0,
        estoque_atual: parseInt(qtd) || 1,
        estoque_minimo: 0,
        categoria: 'outros',
        unidade: 'un',
        codigo: null,
        marca: null,
      });
      toast.success('Peça cadastrada e adicionada!');
      onCriada(peca as Peca);
      setNome(''); setPreco(''); setQtd('1');
    } catch {
      toast.error('Erro ao cadastrar peça');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Cadastrar Nova Peça</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da peça" className="min-h-[44px]" /></div>
          <div><Label>Preço de venda (R$) *</Label><Input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" className="min-h-[44px] font-mono" /></div>
          <div><Label>Quantidade em estoque</Label><Input type="number" min="0" value={qtd} onChange={(e) => setQtd(e.target.value)} className="min-h-[44px]" /></div>
          <Button onClick={handleSalvar} disabled={criarPeca.isPending || !nome.trim() || !preco} className="w-full min-h-[44px]">
            {criarPeca.isPending ? 'Salvando...' : 'Cadastrar e Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VendaAvulsaDialog({ open, onClose, onConfirmar }: { open: boolean; onClose: () => void; onConfirmar: (item: { nome: string; valor: number }) => void }) {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');

  const handleConfirmar = () => {
    if (!nome.trim() || !valor) return;
    onConfirmar({ nome: nome.trim(), valor: parseFloat(valor) });
    setNome(''); setValor('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Venda Avulsa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Descrição *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Serviço de limpeza" className="min-h-[44px]" /></div>
          <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="min-h-[44px] font-mono" /></div>
          <Button onClick={handleConfirmar} disabled={!nome.trim() || !valor} className="w-full min-h-[44px]">
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
