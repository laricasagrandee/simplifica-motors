import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Pencil, Lock, Unlock, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditarOficinaDialog } from './EditarOficinaDialog';
import { NovaOficinaDialog } from './NovaOficinaDialog';
import { useAdminBloquearOficina, useAdminEditarOficina } from '@/hooks/useAdminOficinas';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';
import { normalizarPlano, type PlanoSlug } from '@/lib/planos';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminFuncInfo {
  config_id: string;
  nome: string;
  email: string | null;
}

interface Props {
  oficinas: OficinaComStatus[];
  totalFuncionarios: number;
  admins?: AdminFuncInfo[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  aviso: { label: 'Em Aviso', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  bloqueado: { label: 'Bloqueado', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const planoConfig: Record<PlanoSlug, { label: string; cls: string }> = {
  teste: { label: 'Teste', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  basico: { label: 'Básico', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  profissional: { label: 'Profissional', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  premium: { label: 'Premium', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  enterprise: { label: 'Enterprise', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

const PERIODOS = [
  { label: '1 mês', dias: 30 },
  { label: '3 meses', dias: 90 },
  { label: '6 meses', dias: 180 },
  { label: '12 meses', dias: 365 },
];

function getVencimentoColor(dataVenc: string | null | undefined) {
  if (!dataVenc) return 'text-slate-500';
  const diff = differenceInDays(new Date(dataVenc), new Date());
  if (diff < 0) return 'text-red-400';
  if (diff <= 7) return 'text-amber-400';
  return 'text-emerald-400';
}

export function OficinasTable({ oficinas, totalFuncionarios, admins = [] }: Props) {
  const [editando, setEditando] = useState<OficinaComStatus | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [renovarOficina, setRenovarOficina] = useState<OficinaComStatus | null>(null);
  const [confirmacao, setConfirmacao] = useState<{ oficina: OficinaComStatus; liberar: boolean } | null>(null);
  const bloquear = useAdminBloquearOficina();
  const editar = useAdminEditarOficina();

  const getAdminInfo = (configId: string) => {
    const a = admins.find((x) => x.config_id === configId);
    return a ? { nome: a.nome, email: a.email || '' } : null;
  };

  const handleConfirmar = () => {
    if (!confirmacao) return;
    bloquear.mutate({ id: confirmacao.oficina.id, liberar: confirmacao.liberar }, {
      onSuccess: () => setConfirmacao(null),
    });
  };

  const handleRenovarRapido = (oficina: OficinaComStatus, dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    editar.mutate({
      id: oficina.id,
      plano_ativo: true,
      data_vencimento_plano: new Date(d.toISOString().slice(0, 10) + 'T12:00:00').toISOString(),
    }, { onSuccess: () => setRenovarOficina(null) });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Oficinas</h2>
        <Button size="sm" onClick={() => setNovaOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Oficina
        </Button>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome Fantasia</TableHead>
              <TableHead className="text-slate-400 hidden md:table-cell">Responsável</TableHead>
              <TableHead className="text-slate-400 hidden lg:table-cell">CNPJ</TableHead>
              <TableHead className="text-slate-400 hidden lg:table-cell">Vencimento</TableHead>
              <TableHead className="text-slate-400 hidden md:table-cell">Plano</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oficinas.map((o) => {
              const sc = statusConfig[o.status] || statusConfig.ativo;
              const admin = getAdminInfo(o.id);
              const vencCor = getVencimentoColor(o.data_vencimento_plano);
              return (
                <TableRow key={o.id} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell className="text-white font-medium">{o.nome_fantasia || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {admin ? (
                      <div>
                        <p className="text-sm text-slate-200">{admin.nome}</p>
                        <p className="text-xs text-slate-400 font-mono">{admin.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300 hidden lg:table-cell font-mono text-xs">{o.cnpj || '—'}</TableCell>
                  <TableCell className={cn('hidden lg:table-cell font-medium text-sm', vencCor)}>
                    {o.data_vencimento_plano ? (
                      <div>
                        <span>{format(new Date(o.data_vencimento_plano), 'dd/MM/yyyy')}</span>
                        {(() => {
                          const diff = differenceInDays(new Date(o.data_vencimento_plano), new Date());
                          if (diff < 0) return <span className="text-xs ml-1 opacity-75">(vencido)</span>;
                          if (diff <= 7) return <span className="text-xs ml-1 opacity-75">({diff}d)</span>;
                          return null;
                        })()}
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {(() => {
                      const plano = normalizarPlano(o.plano);
                      const pc = planoConfig[plano];
                      return <Badge variant="outline" className={pc.cls}>{pc.label}</Badge>;
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-700" title="Renovar" onClick={() => setRenovarOficina(o)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700" onClick={() => setEditando(o)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {o.status === 'bloqueado' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700" onClick={() => setConfirmacao({ oficina: o, liberar: true })}>
                          <Unlock className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-700" onClick={() => setConfirmacao({ oficina: o, liberar: false })}>
                          <Lock className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {oficinas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">Nenhuma oficina cadastrada</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editando && (
        <EditarOficinaDialog oficina={editando} adminInfo={getAdminInfo(editando.id)} open={!!editando} onOpenChange={(v) => !v && setEditando(null)} />
      )}
      <NovaOficinaDialog open={novaOpen} onOpenChange={setNovaOpen} />

      {/* Mini dialog de renovação rápida */}
      <Dialog open={!!renovarOficina} onOpenChange={(v) => !v && setRenovarOficina(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Renovar — {renovarOficina?.nome_fantasia}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">Por quanto tempo?</p>
          <div className="grid grid-cols-2 gap-2">
            {PERIODOS.map((p) => (
              <Button
                key={p.dias}
                variant="outline"
                size="sm"
                onClick={() => renovarOficina && handleRenovarRapido(renovarOficina, p.dias)}
                disabled={editar.isPending}
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmacao} onOpenChange={(v) => !v && setConfirmacao(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmacao?.liberar ? 'Liberar Oficina' : 'Bloquear Oficina'}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmacao?.liberar
                ? `Deseja liberar "${confirmacao.oficina.nome_fantasia}"? O vencimento será estendido por 30 dias.`
                : `Deseja bloquear "${confirmacao?.oficina.nome_fantasia}"? A oficina perderá acesso imediatamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmar} className={confirmacao?.liberar ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}>
              {confirmacao?.liberar ? 'Liberar' : 'Bloquear'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
