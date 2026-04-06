import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { CheckCircle, FileText, Truck, MessageCircle } from 'lucide-react';
import { FORMAS_PAGAMENTO } from '@/lib/constants';
import { formatarMoeda } from '@/lib/formatters';
import { usePagamentosOS } from '@/hooks/useOSPagamentos';
import type { OrdemServico, FormaPagamento } from '@/types/database';

interface Props {
  os: OrdemServico;
  onMudarStatus?: (status: string) => Promise<void>;
}

export function PagamentoConfirmado({ os, onMudarStatus }: Props) {
  const navigate = useNavigate();
  const { data: pagamentos = [] } = usePagamentosOS(os.id, Number(os.valor_total) || 0);
  const telefone = os.clientes?.telefone?.replace(/\D/g, '');

  const labelPagamento = (p: { forma_pagamento: string; valor: number; parcelas?: number | null }) => {
    const nome = FORMAS_PAGAMENTO[p.forma_pagamento as FormaPagamento] || p.forma_pagamento;
    const parc = p.parcelas && p.parcelas > 1 ? ` ${p.parcelas}x` : '';
    return `${nome}${parc}`;
  };

  const formasLabel = pagamentos.length > 0
    ? pagamentos.map(p => `${labelPagamento(p)}: ${formatarMoeda(p.valor)}`).join(' + ')
    : FORMAS_PAGAMENTO[os.forma_pagamento as FormaPagamento] || os.forma_pagamento;

  const msg = encodeURIComponent(
    `Pagamento confirmado! OS-${os.numero} — ${formatarMoeda(os.valor_total)} (${formasLabel}).`
  );

  return (
    <div className="flex flex-col items-center py-10 space-y-5">
      <div className="rounded-full bg-success-light p-4">
        <CheckCircle className="h-12 w-12 text-success" strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-xl font-display font-bold text-foreground">Pagamento Confirmado!</h3>
        <MoneyDisplay valor={os.valor_total} className="text-3xl font-display font-bold block" />
      </div>

      {/* Split details */}
      {pagamentos.length > 1 && (
        <div className="w-full max-w-xs space-y-1">
          {pagamentos.map(p => (
            <div key={p.id} className="flex justify-between text-sm text-muted-foreground">
              <span>{labelPagamento(p)}</span>
              <span className="font-medium text-foreground">{formatarMoeda(p.valor)}</span>
            </div>
          ))}
        </div>
      )}
      {pagamentos.length <= 1 && (
        <p className="text-sm text-muted-foreground">{formasLabel}</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button className="w-full h-12 gap-2" onClick={() => navigate(`/nf?os_id=${os.id}`)}>
          <FileText className="h-5 w-5" /> Gerar Nota Fiscal
        </Button>
        {os.status === 'concluida' && onMudarStatus && (
          <Button variant="secondary" className="w-full h-12 gap-2" onClick={() => onMudarStatus('entregue')}>
            <Truck className="h-5 w-5" /> Entregar Veículo
          </Button>
        )}
        {telefone && (
          <Button variant="outline" className="w-full h-12 gap-2" asChild>
            <a href={`https://wa.me/55${telefone}?text=${msg}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5" /> Enviar via WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
