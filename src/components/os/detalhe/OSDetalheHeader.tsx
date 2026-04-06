import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RecusaOrcamentoDialog } from './RecusaOrcamentoDialog';
import { CaixaStatusBadge } from '@/components/shared/CaixaStatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatarNumeroOS } from '@/lib/formatters';
import { validarTransicaoOS } from '@/lib/osValidations';
import { differenceInDays, isBefore, format } from 'date-fns';
import { toast } from 'sonner';
import type { OrdemServico, OSItem, StatusOS } from '@/types/database';

interface Props {
  os: OrdemServico;
  itens: OSItem[];
  onMudarStatus: (status: StatusOS) => Promise<void>;
  onRecusar: (motivo: string) => Promise<void>;
  loading: boolean;
}

const NEXT_STATUS: Partial<Record<StatusOS, { status: StatusOS; label: string }>> = {
  aberta: { status: 'em_orcamento', label: 'Iniciar Orçamento' },
  em_orcamento: { status: 'aprovada', label: 'Enviar para Aprovação' },
  aprovada: { status: 'em_execucao', label: 'Iniciar Execução' },
  em_execucao: { status: 'concluida', label: 'Concluir Serviço' },
};

export function OSDetalheHeader({ os, itens, onMudarStatus, onRecusar, loading }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recusaOpen, setRecusaOpen] = useState(false);
  const next = NEXT_STATUS[os.status];
  const dias = differenceInDays(new Date(), new Date(os.criado_em!));

  const pago = !!os.forma_pagamento;
  const showEntrega = os.status === 'concluida' && pago;
  const entregaBloqueada = os.status === 'concluida' && !pago;

  const handleAvancar = async () => {
    if (!next) return;
    const v = validarTransicaoOS(os, itens, next.status);
    if (!v.valido) { toast.error(v.mensagem); return; }
    await onMudarStatus(next.status);
    setConfirmOpen(false);
  };

  const handleEntrega = async () => {
    const v = validarTransicaoOS(os, itens, 'entregue');
    if (!v.valido) { toast.error(v.mensagem); return; }
    await onMudarStatus('entregue');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-mono font-display text-2xl font-bold text-accent">{formatarNumeroOS(os.numero)}</h1>
        <StatusBadge status={os.status as StatusOS} />
        <CaixaStatusBadge />
        <span className="text-xs text-muted-foreground">
          {os.status === 'entregue' ? `Concluída em ${dias} dias` : `Aberta há ${dias} dia${dias !== 1 ? 's' : ''}`}
        </span>
        {os.garantia_ate && (
          isBefore(new Date(os.garantia_ate), new Date())
            ? <Badge variant="secondary" className="text-xs">Garantia expirada</Badge>
            : <Badge className="bg-success-light text-success border-success-border text-xs">Garantia até {format(new Date(os.garantia_ate), 'dd/MM/yyyy')}</Badge>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {next && (
          <Button onClick={() => setConfirmOpen(true)} disabled={loading}>{next.label}</Button>
        )}
        {showEntrega && (
          <Button variant="secondary" onClick={handleEntrega} disabled={loading}>Registrar Entrega</Button>
        )}
        {entregaBloqueada && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button variant="secondary" disabled>Registrar Entrega</Button></span>
              </TooltipTrigger>
              <TooltipContent>Registre o pagamento antes de entregar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {os.status !== 'cancelada' && os.status !== 'entregue' && (
          <Button variant="ghost" className="text-danger hover:text-danger" onClick={() => setRecusaOpen(true)}>Cancelar OS</Button>
        )}
      </div>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen}
        titulo={`Mudar para "${next?.label}"?`} descricao="Esta ação mudará o status da OS."
        onConfirm={handleAvancar}
        confirmLabel="Confirmar" />
      <RecusaOrcamentoDialog open={recusaOpen} onOpenChange={setRecusaOpen}
        valorOrcamento={os.valor_total ?? 0}
        onConfirm={async (motivo) => { await onRecusar(motivo); await onMudarStatus('cancelada'); }}
        loading={loading} />
    </div>
  );
}
