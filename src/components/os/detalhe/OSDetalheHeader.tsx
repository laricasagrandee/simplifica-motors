import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RecusaOrcamentoDialog } from './RecusaOrcamentoDialog';
import { OrcamentoPreviewDialog } from './OrcamentoPreviewDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatarNumeroOS } from '@/lib/formatters';
import { validarTransicaoOS } from '@/lib/osValidations';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
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
  aberta: { status: 'em_orcamento', label: 'Enviar Orçamento' },
  em_orcamento: { status: 'aprovada', label: 'Cliente Aprovou ✅' },
  aprovada: { status: 'em_execucao', label: 'Começar Serviço 🔧' },
  em_execucao: { status: 'concluida', label: 'Serviço Pronto ✔️' },
};

export function OSDetalheHeader({ os, itens, onMudarStatus, onRecusar, loading }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recusaOpen, setRecusaOpen] = useState(false);
  const [orcamentoPreviewOpen, setOrcamentoPreviewOpen] = useState(false);
  const { data: configData } = useConfiguracoes();
  const next = NEXT_STATUS[os.status];
  const dias = differenceInDays(new Date(), new Date(os.criado_em!));
  const nomeOficina = configData?.nome_fantasia ?? configData?.razao_social ?? 'Oficina';

  const pago = !!os.forma_pagamento;
  const showEntrega = os.status === 'concluida' && pago;
  const entregaBloqueada = os.status === 'concluida' && !pago;

  const handleAvancar = async () => {
    if (!next) return;
    const v = validarTransicaoOS(os, itens, next.status);
    if (!v.valido) { toast.error(v.mensagem); return; }

    const telefone = os.clientes?.telefone?.replace(/\D/g, '');
    const popup = next.status === 'concluida' && telefone ? window.open('about:blank', '_blank') : null;

    try {
      await onMudarStatus(next.status);
      setConfirmOpen(false);

      if (next.status === 'em_orcamento') {
        setOrcamentoPreviewOpen(true);
      }

      if (next.status === 'concluida' && telefone) {
        const veiculoInfo = [os.motos?.marca, os.motos?.modelo, os.motos?.placa].filter(Boolean).join(' ');
        const msg = `Olá${os.clientes?.nome ? `, ${os.clientes.nome}` : ''}!\n\nSeu veículo ${veiculoInfo ? `*${veiculoInfo}* ` : ''}já está *pronto para retirada*.\n\nAguardamos você!`;
        const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`;

        if (popup) popup.location.href = url;
        else window.open(url, '_blank');
      }
    } catch {
      if (popup && !popup.closed) popup.close();
    }
  };

  const handleEntrega = async () => {
    const v = validarTransicaoOS(os, itens, 'entregue');
    if (!v.valido) { toast.error(v.mensagem); return; }
    await onMudarStatus('entregue');
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <h1 className="font-mono font-display text-xl sm:text-2xl font-bold text-accent">{formatarNumeroOS(os.numero)}</h1>
        <StatusBadge status={os.status as StatusOS} />
        <span className="text-xs text-muted-foreground">
          {os.status === 'entregue' ? `${dias}d` : `${dias}d aberta`}
        </span>
        {os.garantia_ate && (
          isBefore(new Date(os.garantia_ate), new Date())
            ? <Badge variant="secondary" className="text-[10px]">Garantia expirada</Badge>
            : <Badge className="bg-success-light text-success border-success-border text-[10px]">Garantia até {format(new Date(os.garantia_ate), 'dd/MM')}</Badge>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {next && (
          <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={loading}>{next.label}</Button>
        )}
        {showEntrega && (
          <Button size="sm" variant="secondary" onClick={handleEntrega} disabled={loading}>Retirou 🚗</Button>
        )}
        {entregaBloqueada && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button size="sm" variant="secondary" disabled>Retirou 🚗</Button></span>
              </TooltipTrigger>
              <TooltipContent>Registre o pagamento antes</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {os.status !== 'cancelada' && os.status !== 'entregue' && (
          <Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => setRecusaOpen(true)}>Cancelar OS</Button>
        )}
      </div>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen}
        titulo={`Mudar para "${next?.label}"?`} descricao="Esta ação mudará o status da OS."
        onConfirm={handleAvancar} confirmLabel="Confirmar" />
      <RecusaOrcamentoDialog open={recusaOpen} onOpenChange={setRecusaOpen}
        valorOrcamento={os.valor_total ?? 0}
        onConfirm={async (motivo) => { await onRecusar(motivo); await onMudarStatus('cancelada'); }}
        loading={loading} />
      <OrcamentoPreviewDialog
        open={orcamentoPreviewOpen}
        onClose={() => setOrcamentoPreviewOpen(false)}
        os={os}
        itens={itens}
        nomeOficina={nomeOficina}
      />
    </div>
  );
}

