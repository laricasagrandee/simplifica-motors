import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useListarPecas } from '@/hooks/usePecas';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import type { Peca } from '@/types/database';

interface PDVBuscaProdutoProps {
  onAdicionar: (peca: Peca) => void;
}

export function PDVBuscaProduto({ onAdicionar }: PDVBuscaProdutoProps) {
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useListarPecas(busca, '', false, 1);
  const pecas = data?.data ?? [];

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
