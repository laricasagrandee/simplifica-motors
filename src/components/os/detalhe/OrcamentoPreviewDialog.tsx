import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';
import type { OrdemServico, OSItem } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  os: OrdemServico;
  itens: OSItem[];
  nomeOficina: string;
}

export function OrcamentoPreviewDialog({ open, onClose, os, itens, nomeOficina }: Props) {
  const pecas = itens.filter(i => i.tipo === 'peca');
  const servicos = itens.filter(i => i.tipo === 'servico');
  const desconto = os.desconto ?? 0;
  const total = pecas.reduce((s, i) => s + i.valor_total, 0) + servicos.reduce((s, i) => s + i.valor_total, 0) - desconto;
  const telefone = os.clientes?.telefone?.replace(/\D/g, '');
  const veiculo = os.motos;

  const buildMsg = () => {
    let msg = `*${nomeOficina}*\nOrçamento OS-${os.numero}\n`;
    if (veiculo) msg += `Veículo: ${[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' ')}\n\n`;
    if (servicos.length > 0) { msg += `*Serviços:*\n`; servicos.forEach(s => { msg += `• ${s.descricao} — ${formatarMoeda(s.valor_total)}\n`; }); msg += `\n`; }
    if (pecas.length > 0) { msg += `*Peças:*\n`; pecas.forEach(p => { msg += `• ${p.descricao} (${p.quantidade}x) — ${formatarMoeda(p.valor_total)}\n`; }); msg += `\n`; }
    if (desconto > 0) msg += `Desconto: -${formatarMoeda(desconto)}\n`;
    msg += `*TOTAL: ${formatarMoeda(total)}*\n\n💳 *Formas de pagamento:*\n• Pix / Dinheiro: ${formatarMoeda(total)}\n`;
    if (total > 0) [2, 3, 4, 5, 6].forEach(n => { const p = total / n; if (p >= 50) msg += `• ${n}x de ${formatarMoeda(p)} no cartão\n`; });
    msg += `\nGostaria de aprovar o orçamento? Responda *SIM* para confirmar! ✅`;
    return msg;
  };

  const handleEnviar = () => {
    if (!telefone) return;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(buildMsg())}`, '_blank');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Preview do Orçamento</DialogTitle>
          <DialogDescription>
            Revise a mensagem antes de enviar o orçamento pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm"><span className="font-medium">Cliente:</span> {os.clientes?.nome ?? '—'}</p>
            {veiculo && <p className="text-sm"><span className="font-medium">Veículo:</span> {[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' ')}</p>}
          </div>

          {servicos.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Serviços</p>
              {servicos.map(s => (
                <div key={s.id} className="flex justify-between text-sm py-1 border-b border-border">
                  <span>{s.descricao}</span>
                  <span className="font-mono">{formatarMoeda(s.valor_total)}</span>
                </div>
              ))}
            </div>
          )}

          {pecas.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Peças</p>
              {pecas.map(p => (
                <div key={p.id} className="flex justify-between text-sm py-1 border-b border-border">
                  <span>{p.descricao} ({p.quantidade}x)</span>
                  <span className="font-mono">{formatarMoeda(p.valor_total)}</span>
                </div>
              ))}
            </div>
          )}

          {desconto > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Desconto</span>
              <span className="font-mono">-{formatarMoeda(desconto)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono">{formatarMoeda(total)}</span>
          </div>

          {total > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Parcelamento</p>
              <div className="text-sm space-y-0.5">
                <p>• Pix / Dinheiro: {formatarMoeda(total)}</p>
                {[2, 3, 4, 5, 6].map(n => {
                  const p = total / n;
                  return p >= 50 ? <p key={n}>• {n}x de {formatarMoeda(p)} no cartão</p> : null;
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Voltar</Button>
            <Button onClick={handleEnviar} disabled={!telefone}>Enviar pelo WhatsApp</Button>
          </div>
          {!telefone && <p className="text-xs text-destructive">Cliente sem telefone cadastrado</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
