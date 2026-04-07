import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function defaultVencimento() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function NovaOficinaDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_fantasia: '',
    cnpj: '',
    telefone_oficina: '',
    nome_responsavel: '',
    email: '',
    senha: '',
    telefone_responsavel: '',
    data_vencimento: defaultVencimento(),
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({
      nome_fantasia: '', cnpj: '', telefone_oficina: '',
      nome_responsavel: '', email: '', senha: '', telefone_responsavel: '',
      data_vencimento: defaultVencimento(),
    });
  };

  const handleCriar = async () => {
    if (!form.nome_fantasia.trim() || !form.nome_responsavel.trim() || !form.email.trim() || !form.senha.trim()) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (form.senha.length < 6) {
      toast({ title: 'A senha deve ter no mínimo 6 caracteres', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const vencimento = new Date(form.data_vencimento + 'T12:00:00').toISOString();

      const { data, error } = await supabase.functions.invoke('admin-create-tenant', {
        body: {
          email: form.email.trim().toLowerCase(),
          password: form.senha,
          nome_responsavel: form.nome_responsavel.trim(),
          telefone_responsavel: form.telefone_responsavel.trim(),
          nome_fantasia: form.nome_fantasia.trim(),
          cnpj: form.cnpj.trim() || null,
          telefone_oficina: form.telefone_oficina.trim() || null,
          data_vencimento: vencimento,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const dataFormatada = format(new Date(form.data_vencimento), 'dd/MM/yyyy');

      toast({
        title: 'Oficina criada com sucesso!',
        description: `Login: ${form.email.trim().toLowerCase()} — Acesso até ${dataFormatada}`,
      });
      qc.invalidateQueries({ queryKey: ['admin-oficinas'] });
      qc.invalidateQueries({ queryKey: ['admin-funcionarios-count'] });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao criar oficina', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = form.nome_fantasia.trim() && form.nome_responsavel.trim() && form.email.trim() && form.senha.trim() && form.senha.length >= 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Nova Oficina</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Dados da Oficina</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Nome Fantasia *</Label>
                <Input value={form.nome_fantasia} onChange={(e) => set('nome_fantasia', e.target.value)} placeholder="Ex: Auto Center Exemplo" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Telefone</Label>
                  <Input value={form.telefone_oficina} onChange={(e) => set('telefone_oficina', e.target.value)} placeholder="(00) 00000-0000" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Responsável (Admin)</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Nome do Responsável *</Label>
                <Input value={form.nome_responsavel} onChange={(e) => set('nome_responsavel', e.target.value)} placeholder="Nome completo" className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Email (login) *</Label>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@exemplo.com" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Senha inicial *</Label>
                  <Input type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} placeholder="Mín. 6 caracteres" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Telefone do Responsável</Label>
                <Input value={form.telefone_responsavel} onChange={(e) => set('telefone_responsavel', e.target.value)} placeholder="(00) 00000-0000" className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Vencimento</h3>
            <div>
              <Label className="text-slate-300">Data de vencimento</Label>
              <Input type="date" value={form.data_vencimento} onChange={(e) => set('data_vencimento', e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
              <p className="text-xs text-slate-500 mt-1">Padrão: 30 dias a partir de hoje. Após 15 dias do vencimento sem renovação, o acesso será bloqueado.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button
            onClick={handleCriar}
            disabled={saving || !canSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Criando...</> : 'Criar Oficina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
