import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { CHECKLIST_EXECUCAO, CHECKLIST_ENTREGA } from '@/hooks/useOSChecklist';
import type { ChecklistItem } from '@/types/database';

interface Props {
  checklist: ChecklistItem[];
  loading: boolean;
  onAtualizar: (items: ChecklistItem[]) => void;
  editavel: boolean;
  nomeUsuario?: string;
  tipo?: 'execucao' | 'entrega';
}

export function OSChecklistTab({ checklist, loading, onAtualizar, editavel, nomeUsuario, tipo = 'execucao' }: Props) {
  const [novoTexto, setNovoTexto] = useState('');

  const toggleItem = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, concluido: !item.concluido, concluidoEm: !item.concluido ? new Date().toISOString() : undefined, concluidoPor: !item.concluido ? nomeUsuario : undefined } : item
    );
    onAtualizar(updated);
  };

  const addItem = () => {
    if (!novoTexto.trim()) return;
    const item: ChecklistItem = { id: crypto.randomUUID(), texto: novoTexto.trim(), concluido: false };
    onAtualizar([...checklist, item]);
    setNovoTexto('');
  };

  const addPadrao = () => {
    const base = tipo === 'entrega' ? CHECKLIST_ENTREGA : CHECKLIST_EXECUCAO;
    const novos: ChecklistItem[] = base.map((p) => ({ ...p, id: crypto.randomUUID() }));
    onAtualizar([...checklist, ...novos]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
            <Checkbox checked={item.concluido} onCheckedChange={() => editavel && toggleItem(item.id)} disabled={!editavel} className="mt-0.5" />
            <div className="min-w-0">
              <p className={`text-sm ${item.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.texto}</p>
              {item.concluido && item.concluidoPor && (
                <p className="text-[10px] text-muted-foreground">✓ por {item.concluidoPor}</p>
              )}
            </div>
          </div>
        ))}
        {checklist.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum item no checklist.</p>}
      </div>

      {editavel && (
        <>
          <div className="flex gap-2">
            <Input value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} placeholder="Novo item..." maxLength={200}
              onKeyDown={(e) => e.key === 'Enter' && addItem()} className="min-h-[44px]" />
            <Button size="icon" onClick={addItem} className="shrink-0 min-w-[44px]"><Plus className="h-4 w-4" /></Button>
          </div>
          {checklist.length === 0 && (
            <Button variant="outline" size="sm" onClick={addPadrao}>Adicionar checklist padrão</Button>
          )}
        </>
      )}
    </div>
  );
}
