import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Lock, Unlock, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditarOficinaDialog } from './EditarOficinaDialog';
import { NovaOficinaDialog } from './NovaOficinaDialog';
import { useAdminBloquearOficina } from '@/hooks/useAdminOficinas';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  oficinas: OficinaComStatus[];
  totalFuncionarios: number;
}

const statusConfig = {
  ativo: { label: 'Ativo', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  tolerancia: { label: 'Tolerância', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  bloqueado: { label: 'Bloqueado', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export function OficinasTable({ oficinas, totalFuncionarios }: Props) {
  const [editando, setEditando] = useState<OficinaComStatus | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [confirmacao, setConfirmacao] = useState<{ oficina: OficinaComStatus; liberar: boolean } | null>(null);
  const bloquear = useAdminBloquearOficina();

  const handleConfirmar = () => {
    if (!confirmacao) return;
    bloquear.mutate({ id: confirmacao.oficina.id, liberar: confirmacao.liberar }, {
      onSuccess: () => setConfirmacao(null),
    });
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
              <TableHead className="text-slate-400 hidden md:table-cell">CNPJ</TableHead>
              <TableHead className="text-slate-400">Plano</TableHead>
              <TableHead className="text-slate-400 hidden lg:table-cell">Vencimento</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 hidden md:table-cell">Funcionários</TableHead>
              <TableHead className="text-slate-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oficinas.map((o) => {
              const sc = statusConfig[o.status];
              return (
                <TableRow key={o.id} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell className="text-white font-medium">{o.nome_fantasia || '—'}</TableCell>
                  <TableCell className="text-slate-300 hidden md:table-cell font-mono text-xs">{o.cnpj || '—'}</TableCell>
                  <TableCell className="text-slate-300 capitalize">{o.plano || '—'}</TableCell>
                  <TableCell className="text-slate-300 hidden lg:table-cell">
                    {o.data_vencimento_plano ? format(new Date(o.data_vencimento_plano), 'dd/MM/yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 hidden md:table-cell">
                    {totalFuncionarios}/{o.max_funcionarios || '∞'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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

      {editando && <EditarOficinaDialog oficina={editando} open={!!editando} onOpenChange={(v) => !v && setEditando(null)} />}
      <NovaOficinaDialog open={novaOpen} onOpenChange={setNovaOpen} />

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
