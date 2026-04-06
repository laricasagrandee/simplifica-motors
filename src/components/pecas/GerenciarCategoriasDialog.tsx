import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react';
import { useCategoriasPecas } from '@/hooks/useCategoriasPecas';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GerenciarCategoriasDialog({ open, onClose }: Props) {
  const { categorias, adicionar, editar, excluir, restaurarPadrao } = useCategoriasPecas();
  const [nova, setNova] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoLabel, setEditandoLabel] = useState('');

  const handleAdicionar = () => {
    const label = nova.trim();
    if (!label) return;
    if (categorias.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
      toast.error('Categoria já existe');
      return;
    }
    adicionar(label);
    setNova('');
    toast.success('Categoria adicionada');
  };

  const handleSalvarEdicao = () => {
    if (!editandoId || !editandoLabel.trim()) return;
    editar(editandoId, editandoLabel.trim());
    setEditandoId(null);
    toast.success('Categoria atualizada');
  };

  const handleExcluir = (id: string, label: string) => {
    excluir(id);
    toast.success(`"${label}" removida`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        {/* Add new */}
        <div className="flex gap-2">
          <Input
            placeholder="Nova categoria..."
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
            className="min-h-[44px]"
            maxLength={50}
          />
          <Button onClick={handleAdicionar} size="icon" className="shrink-0 h-11 w-11">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1 mt-2">
          {categorias.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
              {editandoId === cat.id ? (
                <>
                  <Input
                    value={editandoLabel}
                    onChange={(e) => setEditandoLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSalvarEdicao()}
                    className="flex-1 h-9"
                    maxLength={50}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleSalvarEdicao}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditandoId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-foreground">{cat.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => { setEditandoId(cat.id); setEditandoLabel(cat.label); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-danger hover:text-danger"
                    onClick={() => handleExcluir(cat.id, cat.label)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-3 border-t">
          <Button variant="outline" size="sm" onClick={restaurarPadrao} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
