import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminEditarOficina } from '@/hooks/useAdminOficinas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Gift, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';

interface Props {
  oficina: OficinaComStatus;
  adminInfo?: { nome: string; email: string } | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

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

function getStatusInfo(oficina: OficinaComStatus) {
  if (!oficina.data_vencimento_plano) return null;
  const venc = new Date(oficina.data_vencimento_plano);
  const hoje = new Date();
  const diff = differenceInDays(venc, hoje);
  const dataFmt = format(venc, 'dd/MM/yyyy');

  if (!oficina.plano_ativo) {
    return { text: `Acesso bloqueado manualmente`, cls: 'bg-red-500/10 border-red-500/30 text-red-400' };
  }
  if (diff < 0) {
    return { text: `Acesso vencido desde ${dataFmt}`, cls: 'bg-red-500/10 border-red-500/30 text-red-400' };
  }
  if (oficina.plano === 'teste') {
    return { text: `Em teste grátis até ${dataFmt} (${diff} dias restantes)`, cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' };
  }
  return { text: `Acesso ativo até ${dataFmt} (faltam ${diff} dias)`, cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
}

export function EditarOficinaDialog({ oficina, adminInfo, open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    nome_fantasia: oficina.nome_fantasia || '',
    cnpj: oficina.cnpj || '',
    data_vencimento_plano: oficina.data_vencimento_plano?.slice(0, 10) || '',
    plano_ativo: oficina.plano_ativo ?? true,
  });
  const [resetando, setResetando] = useState(false);

  const editar = useAdminEditarOficina();

  const statusInfo = getStatusInfo(oficina);

  const handleSave = () => {
    editar.mutate({
      id: oficina.id,
      nome_fantasia: form.nome_fantasia,
      cnpj: form.cnpj || null,
      data_vencimento_plano: form.data_vencimento_plano ? new Date(form.data_vencimento_plano + 'T12:00:00').toISOString() : null,
      plano_ativo: form.plano_ativo,
    }, { onSuccess: () => onOpenChange(false) });
  };

  const handleRenovar = (dias: number) => {
    const novaData = calcVencimento(dias);
    editar.mutate({
      id: oficina.id,
      plano_ativo: true,
      data_vencimento_plano: new Date(novaData + 'T12:00:00').toISOString(),
    }, { onSuccess: () => onOpenChange(false) });
  };

  const handleTeste30 = () => {
    const novaData = calcVencimento(30);
    editar.mutate({
      id: oficina.id,
      plano_ativo: true,
      plano: 'teste',
      data_vencimento_plano: new Date(novaData + 'T12:00:00').toISOString(),
    }, { onSuccess: () => onOpenChange(false) });
  };

  const handleResetSenha = async () => {
    if (!adminInfo?.email) return;
    setResetando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(adminInfo.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast({ title: 'Link de redefinição enviado!', description: `Email enviado para ${adminInfo.email}` });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar link', description: err.message, variant: 'destructive' });
    } finally {
      setResetando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Oficina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Status atual */}
          {statusInfo && (
            <div className={cn('rounded-lg border p-3 text-sm font-medium', statusInfo.cls)}>
              {statusInfo.text}
            </div>
          )}

          {/* Dados básicos */}
          <div>
            <Label className="text-slate-300">Nome Fantasia</Label>
            <Input value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">CNPJ</Label>
            <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">Vencimento</Label>
            <Input type="date" value={form.data_vencimento_plano} onChange={(e) => setForm({ ...form, data_vencimento_plano: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">Acesso Ativo</Label>
            <Switch checked={form.plano_ativo} onCheckedChange={(v) => setForm({ ...form, plano_ativo: v })} />
          </div>

          {/* Renovar Acesso */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Renovar Acesso
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {PERIODOS.map((p) => (
                <Button
                  key={p.dias}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenovar(p.dias)}
                  disabled={editar.isPending}
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTeste30}
              disabled={editar.isPending}
              className="w-full mt-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs"
            >
              <Gift className="h-3.5 w-3.5 mr-1" /> Ativar Teste 30 dias
            </Button>
          </div>

          {/* Responsável */}
          {adminInfo && (
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Responsável</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{adminInfo.nome}</p>
                  <p className="text-xs text-slate-400 font-mono">{adminInfo.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetSenha} disabled={resetando} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {resetando ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <KeyRound className="h-3.5 w-3.5 mr-1" />}
                  Resetar Senha
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300">Cancelar</Button>
          <Button onClick={handleSave} disabled={editar.isPending || !form.nome_fantasia}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
