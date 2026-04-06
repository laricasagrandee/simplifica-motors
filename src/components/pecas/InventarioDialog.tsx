import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useItensInventario, useContarItem, useFinalizarInventario, type Inventario } from '@/hooks/useInventario';
import { Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  inventario: Inventario;
}

export function InventarioDialog({ open, onClose, inventario }: Props) {
  const { data: itens, isLoading } = useItensInventario(inventario.id);
  const contar = useContarItem();
  const finalizar = useFinalizarInventario();
  const [busca, setBusca] = useState('');

  const contados = itens?.filter((i) => i.estoque_contado !== null).length ?? 0;
  const total = itens?.length ?? 0;
  const progresso = total > 0 ? (contados / total) * 100 : 0;

  const filtered = itens?.filter((i) => {
    if (!busca) return true;
    const p = i.pecas as unknown as { nome: string; codigo: string | null } | null;
    const term = busca.toLowerCase();
    return p?.nome.toLowerCase().includes(term) || p?.codigo?.toLowerCase().includes(term);
  }) ?? [];

  const handleContar = (id: string, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    contar.mutate({ id, estoque_contado: num });
  };

  const handleFinalizar = () => {
    if (contados < total && !confirm(`Apenas ${contados} de ${total} itens foram contados. Deseja finalizar mesmo assim?`)) return;
    finalizar.mutate(inventario.id, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center justify-between">
            <span>Inventário — {inventario.data}</span>
            <span className="text-xs font-normal text-muted-foreground">{contados}/{total} contados</span>
          </DialogTitle>
        </DialogHeader>

        <Progress value={progresso} className="h-2" />

        <Input placeholder="Buscar peça..." value={busca} onChange={(e) => setBusca(e.target.value)} className="min-h-[40px]" />

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-1">
          {isLoading ? (
            <LoadingState />
          ) : !filtered.length ? (
            <EmptyState icon={Package} titulo="Nenhuma peça encontrada" descricao="" />
          ) : (
            filtered.map((item) => {
              const p = item.pecas as unknown as { nome: string; codigo: string | null } | null;
              const diff = item.estoque_contado !== null ? (item.estoque_contado ?? 0) - item.estoque_sistema : null;
              return (
                <div key={item.id} className={cn(
                  'flex items-center gap-3 p-2 rounded-lg border text-sm',
                  diff !== null && diff < 0 && 'border-destructive/40 bg-destructive/5',
                  diff !== null && diff > 0 && 'border-green-500/40 bg-green-500/5',
                  item.estoque_contado !== null && diff === 0 && 'border-border bg-muted/30',
                )}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p?.nome ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{p?.codigo ?? 'S/C'} · Sistema: {item.estoque_sistema}</p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Qtd"
                    defaultValue={item.estoque_contado ?? ''}
                    onBlur={(e) => e.target.value && handleContar(item.id, e.target.value)}
                    className="w-20 h-9 text-center"
                  />
                  {diff !== null && diff !== 0 && (
                    <span className={cn('text-xs font-semibold w-10 text-right', diff < 0 ? 'text-destructive' : 'text-green-600')}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                  )}
                  {diff === 0 && item.estoque_contado !== null && (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={handleFinalizar} disabled={finalizar.isPending || contados === 0}>
            {finalizar.isPending ? 'Finalizando...' : 'Finalizar Inventário'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
