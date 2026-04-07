import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2, FlaskConical, CreditCard } from 'lucide-react';
import { PLANOS_CONFIG } from '@/hooks/useAdminOficinas';
import { formatarMoeda } from '@/lib/formatters';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type TipoAtivacao = 'teste' | 'pago';

function defaultVencimento(dias = 30) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const PLANOS_PAGOS = ['basico', 'profissional', 'premium', 'enterprise'] as const;

export function NovaOficinaDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [tipoAtivacao, setTipoAtivacao] = useState<TipoAtivacao>('teste');
  const [form, setForm] = useState({
    nome_fantasia: '',
    cnpj: '',
    telefone_oficina: '',
    nome_responsavel: '',
    email: '',
    senha: '',
    telefone_responsavel: '',
    plano_pago: 'basico',
    data_vencimento: defaultVencimento(),
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const planoFinal = tipoAtivacao === 'teste' ? 'teste' : form.plano_pago;
  const configPlano = PLANOS_CONFIG[planoFinal];
  const maxFunc = configPlano?.maxFunc || 2;
  const diasTolerancia = tipoAtivacao === 'teste' ? 5 : 15;

  const resetForm = () => {
    setForm({
      nome_fantasia: '', cnpj: '', telefone_oficina: '',
      nome_responsavel: '', email: '', senha: '', telefone_responsavel: '',
      plano_pago: 'basico', data_vencimento: defaultVencimento(),
    });
    setTipoAtivacao('teste');
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
      const vencimento = tipoAtivacao === 'teste'
        ? new Date(Date.now() + 30 * 86400000).toISOString()
        : new Date(form.data_vencimento + 'T12:00:00').toISOString();

      const { data, error } = await supabase.functions.invoke('admin-create-tenant', {
        body: {
          email: form.email.trim().toLowerCase(),
          password: form.senha,
          nome_responsavel: form.nome_responsavel.trim(),
          telefone_responsavel: form.telefone_responsavel.trim(),
          nome_fantasia: form.nome_fantasia.trim(),
          cnpj: form.cnpj.trim() || null,
          telefone_oficina: form.telefone_oficina.trim() || null,
          plano: planoFinal,
          data_vencimento: vencimento,
          max_funcionarios: maxFunc,
          dias_tolerancia: diasTolerancia,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const dataVencFormatada = tipoAtivacao === 'teste'
        ? format(new Date(Date.now() + 30 * 86400000), 'dd/MM/yyyy')
        : format(new Date(form.data_vencimento), 'dd/MM/yyyy');

      toast({
        title: 'Oficina criada com sucesso!',
        description: tipoAtivacao === 'teste'
          ? `Login: ${form.email.trim().toLowerCase()} — Teste grátis até ${dataVencFormatada}`
          : `Login: ${form.email.trim().toLowerCase()} — Plano ${configPlano.label} até ${dataVencFormatada}`,
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

          {/* Dados do Responsável */}
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

          {/* Tipo de Ativação */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tipo de Ativação</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setTipoAtivacao('teste')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  tipoAtivacao === 'teste'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <FlaskConical className="h-6 w-6" />
                <span className="font-semibold text-sm">Teste Grátis</span>
                <span className="text-xs opacity-75">30 dias • 2 funcionários</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoAtivacao('pago')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  tipoAtivacao === 'pago'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="font-semibold text-sm">Plano Pago</span>
                <span className="text-xs opacity-75">Escolher plano</span>
              </button>
            </div>

            {tipoAtivacao === 'pago' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <Label className="text-slate-300">Plano</Label>
                  <Select value={form.plano_pago} onValueChange={(v) => set('plano_pago', v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANOS_PAGOS.map((key) => {
                        const cfg = PLANOS_CONFIG[key];
                        return (
                          <SelectItem key={key} value={key}>
                            {cfg.label} — {formatarMoeda(cfg.preco)}/mês ({cfg.maxFunc === 999 ? 'ilimitado' : `${cfg.maxFunc} func.`})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Vencimento</Label>
                  <Input type="date" value={form.data_vencimento} onChange={(e) => set('data_vencimento', e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="mt-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Plano:</span>
                <span className="font-medium text-white">{configPlano.label}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Máx. funcionários:</span>
                <span className="font-medium text-white">{maxFunc === 999 ? 'Ilimitado' : maxFunc}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tolerância:</span>
                <span className="font-medium text-white">{diasTolerancia} dias</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Valor:</span>
                <span className="font-medium text-white">
                  {configPlano.preco === 0 ? 'Grátis' : `${formatarMoeda(configPlano.preco)}/mês`}
                </span>
              </div>
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
