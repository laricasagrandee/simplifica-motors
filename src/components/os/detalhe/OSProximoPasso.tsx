import { useState } from 'react';
import { FileEdit, Send, Wrench, Clock, DollarSign, CheckCircle, CalendarClock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useAtualizarOS } from '@/hooks/useOSDetalhe';
import { OrcamentoPreviewDialog } from './OrcamentoPreviewDialog';
import { formatarVeiculoCompleto } from '@/lib/veiculoUtils';
import { formatarMoeda } from '@/lib/formatters';
import { isBefore, format } from 'date-fns';
import type { OrdemServico, OSItem, StatusOS } from '@/types/database';

interface Props {
  os: OrdemServico;
  itens?: OSItem[];
  onMudarStatus: (status: StatusOS) => Promise<void>;
  onTabChange: (tab: string) => void;
  loading: boolean;
}

const configs: Record<string, {
  icon: React.ElementType; bg: string; border: string; text: string;
}> = {
  aberta: { icon: FileEdit, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  em_orcamento: { icon: Send, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  aprovada: { icon: Wrench, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  em_execucao: { icon: Clock, bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
  concluida: { icon: DollarSign, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  entregue: { icon: CheckCircle, bg: 'bg-muted', border: 'border', text: 'text-muted-foreground' },
};

function getMsg(os: OrdemServico) {
  const pago = !!os.forma_pagamento;
  const msgs: Record<string, string> = {
    aberta: 'Monte o orçamento: adicione peças e serviços na aba Orçamento',
    em_orcamento: 'Orçamento enviado! Aguarde o cliente aprovar',
    aprovada: 'Cliente aprovou! Pode começar o serviço',
    em_execucao: 'Serviço em andamento. Quando terminar, clique em Serviço Pronto',
    concluida: pago ? 'Serviço pronto! Entregue o veículo ao cliente' : 'Serviço pronto! Registre o pagamento e entregue o veículo',
    entregue: 'Tudo certo! OS finalizada com sucesso',
  };
  return msgs[os.status] ?? '';
}

export function OSProximoPasso({ os, itens = [], onMudarStatus, onTabChange, loading }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: config } = useConfiguracoes();
  const atualizar = useAtualizarOS();
  const cfg = configs[os.status];
  if (!cfg) return null;

  const Icon = cfg.icon;
  const telefone = os.clientes?.telefone?.replace(/\D/g, '');
  const nomeOficina = config?.nome_fantasia ?? 'Nossa Oficina';
  const pago = !!os.forma_pagamento;

  const previsaoAtrasada = os.previsao_entrega && os.status !== 'concluida' && os.status !== 'entregue'
    && isBefore(new Date(os.previsao_entrega), new Date());

  const veiculoLabel = formatarVeiculoCompleto(os.motos as unknown as Record<string, string> | undefined);
  const msgPronto = `Olá ${os.clientes?.nome ?? 'Cliente'}! Seu veículo ${veiculoLabel} está pronto para retirada aqui na ${nomeOficina}. O valor total é ${formatarMoeda(os.valor_total ?? 0)}. Aceitamos Pix, cartão e dinheiro. Aguardamos você!`;

  void onMudarStatus;
  void itens;
  void loading;

  return (
    <>
      <div className={`${cfg.bg} ${cfg.border} border rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
        <Icon className={`h-5 w-5 shrink-0 ${cfg.text}`} />
        <div className="flex-1 space-y-1">
          <p className={`text-sm font-medium ${cfg.text}`}>{getMsg(os)}</p>
          {os.status === 'em_execucao' && os.previsao_entrega && (
            <p className={`text-xs font-medium ${previsaoAtrasada ? 'text-destructive' : 'text-muted-foreground'}`}>
              {previsaoAtrasada
                ? `⚠️ Atrasada! Previsão era ${format(new Date(os.previsao_entrega + 'T00:00:00'), 'dd/MM/yyyy')}`
                : `Previsão: ${format(new Date(os.previsao_entrega + 'T00:00:00'), 'dd/MM/yyyy')}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {os.status === 'em_execucao' && (
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                className="h-8 w-36 text-xs"
                value={os.previsao_entrega ?? ''}
                onChange={(e) => atualizar.mutate({ id: os.id, previsao_entrega: e.target.value || null })}
              />
            </div>
          )}
          {os.status === 'aberta' && <Button size="sm" variant="outline" onClick={() => onTabChange('orcamento')}>Ir para Orçamento</Button>}
          {os.status === 'em_orcamento' && telefone && (
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>Enviar via WhatsApp</Button>
          )}
          {os.status === 'concluida' && telefone && (
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <a href={`https://wa.me/55${telefone}?text=${encodeURIComponent(msgPronto)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5" /> Avisar Cliente
              </a>
            </Button>
          )}
          {os.status === 'concluida' && !pago && <Button size="sm" onClick={() => onTabChange('pagamento')}>Registrar Pagamento</Button>}
          {os.status === 'entregue' && telefone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`https://wa.me/55${telefone}?text=${encodeURIComponent('Obrigado pela preferência! Como foi sua experiência?')}`} target="_blank" rel="noreferrer">Enviar Pesquisa</a>
            </Button>
          )}
        </div>
      </div>
      <OrcamentoPreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} os={os} itens={itens} nomeOficina={nomeOficina} />
    </>
  );
}

