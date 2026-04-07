import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminNovaOficina } from '@/hooks/useAdminOficinas';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NovaOficinaDialog({ open, onOpenChange }: Props) {
  const [nome, setNome] = useState('');
  const criar = useAdminNovaOficina();

  const handleCriar = () => {
    criar.mutate(nome.trim(), { onSuccess: () => { setNome(''); onOpenChange(false); } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova Oficina</DialogTitle>
        </DialogHeader>
        <div>
          <Label className="text-slate-300">Nome Fantasia *</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Auto Center Exemplo" className="bg-slate-700 border-slate-600 text-white" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button onClick={handleCriar} disabled={criar.isPending || !nome.trim()}>Criar Oficina</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
