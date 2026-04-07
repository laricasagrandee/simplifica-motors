import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2, Gift, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type TipoAcesso = 'teste' | 'pago';

const PERIODOS = [
  { label: '1 mês', dias: 30 },
  { label: '3 meses', dias: 90 },
  { label: '6 meses', dias: 180 },
  { label: '12 meses', dias: 365 },
];

function calcVencimento(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function NovaOficinaDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [tipoAcesso, setTipoAcesso] = useState<TipoAcesso>('teste');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome_fantasia: '',
    cnpj: '',
    telefone_oficina: '',
    nome_responsavel: '',
    email: '',
    senha: '',
    telefone_responsavel: '',
    data_vencimento: calcVencimento(30),
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleTipoAcesso = (tipo: TipoAcesso) => {
    setTipoAcesso(tipo);
    if (tipo === 'teste') {
      setForm((prev) => ({ ...prev, data_vencimento: calcVencimento(30) }));
      setPeriodoSelecionado(null);
    }
  };

  const handlePeriodo = (dias: number) => {
    setPeriodoSelecionado(dias);
    setForm((prev) => ({ ...prev, data_vencimento: calcVencimento(dias) }));
  };

  const resetForm = () => {
    setForm({
      nome_fantasia: '', cnpj: '', telefone_oficina: '',
      nome_responsavel: '', email: '', senha: '', telefone_responsavel: '',
      data_vencimento: calcVencimento(30),
    });
    setTipoAcesso('teste');
    setPeriodoSelecionado(null);
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
          {/* Dados da Oficina */}
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

          {/* Responsável */}
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

          {/* Tipo de Acesso */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tipo de Acesso</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTipoAcesso('teste')}
                className={cn(
                  'rounded-lg border-2 p-4 text-left transition-all',
                  tipoAcesso === 'teste'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold text-white text-sm">Teste Grátis</span>
                </div>
                <p className="text-xs text-slate-400">30 dias grátis para experimentar</p>
              </button>

              <button
                type="button"
                onClick={() => handleTipoAcesso('pago')}
                className={cn(
                  'rounded-lg border-2 p-4 text-left transition-all',
                  tipoAcesso === 'pago'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-white text-sm">Cliente Pagou</span>
                </div>
                <p className="text-xs text-slate-400">Já fez o pagamento</p>
              </button>
            </div>

            {tipoAcesso === 'pago' && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  {PERIODOS.map((p) => (
                    <Button
                      key={p.dias}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePeriodo(p.dias)}
                      className={cn(
                        'flex-1 text-xs',
                        periodoSelecionado === p.dias
                          ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      )}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vencimento */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Vencimento</h3>
            <div>
              <Label className="text-slate-300">Data de vencimento</Label>
              <Input
                type="date"
                value={form.data_vencimento}
                onChange={(e) => set('data_vencimento', e.target.value)}
                disabled={tipoAcesso === 'teste'}
                className={cn(
                  'bg-slate-700 border-slate-600 text-white',
                  tipoAcesso === 'teste' && 'opacity-60 cursor-not-allowed'
                )}
              />
              {tipoAcesso === 'teste' ? (
                <p className="text-xs text-blue-400 mt-1">
                  Teste grátis de 30 dias — acesso até {format(new Date(form.data_vencimento), 'dd/MM/yyyy')}
                </p>
              ) : (
                <p className="text-xs text-emerald-400 mt-1">
                  Acesso até: {format(new Date(form.data_vencimento), 'dd/MM/yyyy')}
                </p>
              )}
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
