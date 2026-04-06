import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { formatarMoeda } from '@/lib/formatters';
import { PDVClienteSelect } from './PDVClienteSelect';
import type { FormaPagamento } from '@/types/database';

interface Props {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirmar: (clienteId: string | null, forma: FormaPagamento, parcelas: number) => void;
  loading: boolean;
}

const formaOptions = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'boleto', label: 'Boleto' },
];

export function PDVPagamentoDialog({ open, total, onClose, onConfirmar, loading }: Props) {
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [forma, setForma] = useState<FormaPagamento>('dinheiro');
  const [parcelas, setParcelas] = useState(1);
  const [recebido, setRecebido] = useState(0);

  const troco = forma === 'dinheiro' ? Math.max(0, recebido - total) : 0;

  const handleConfirmar = () => onConfirmar(clienteId, forma, parcelas);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Pagamento</DialogTitle>
        </DialogHeader>

        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-display text-3xl font-bold text-primary">{formatarMoeda(total)}</p>
        </div>

        <div className="space-y-4">
          <PDVClienteSelect clienteId={clienteId} onChange={setClienteId} />

          <div>
            <Label>Forma de Pagamento</Label>
            <SearchableSelect value={forma} onValueChange={(v) => { setForma(v as FormaPagamento); setParcelas(1); }} options={formaOptions} placeholder="Selecione" />
          </div>

          {forma === 'dinheiro' && (
            <DinheiroSection total={total} recebido={recebido} troco={troco} onRecebidoChange={setRecebido} />
          )}

          {forma === 'cartao_credito' && (
            <ParcelasSection total={total} parcelas={parcelas} onParcelasChange={setParcelas} />
          )}

          <Button onClick={handleConfirmar} disabled={loading} className="w-full h-12 font-bold">
            {loading ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DinheiroSection({ total, recebido, troco, onRecebidoChange }: {
  total: number; recebido: number; troco: number; onRecebidoChange: (v: number) => void;
}) {
  const atalhos = [50, 100, 200];
  return (
    <div className="space-y-2">
      <Label>Valor Recebido</Label>
      <Input
        type="number"
        value={recebido || ''}
        onChange={(e) => onRecebidoChange(parseFloat(e.target.value) || 0)}
        className="h-12 text-lg font-mono"
        min={0}
        step={0.01}
      />
      <div className="flex gap-2">
        {atalhos.map((v) => (
          <Button key={v} variant="outline" size="sm" onClick={() => onRecebidoChange(v)}>R$ {v}</Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => onRecebidoChange(total)}>Exato</Button>
      </div>
      {recebido >= total && (
        <div className="bg-[hsl(var(--accent-green-light))] border border-[hsl(var(--accent-green-border))] rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">Troco</p>
          <p className="font-mono text-xl font-bold text-primary">{formatarMoeda(troco)}</p>
        </div>
      )}
    </div>
  );
}

function ParcelasSection({ total, parcelas, onParcelasChange }: {
  total: number; parcelas: number; onParcelasChange: (v: number) => void;
}) {
  const options = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
    value: String(n),
    label: `${n}x de ${formatarMoeda(total / n)}`,
  }));

  return (
    <div>
      <Label>Parcelas</Label>
      <SearchableSelect value={String(parcelas)} onValueChange={(v) => onParcelasChange(Number(v))} options={options} placeholder="Selecione" />
    </div>
  );
}
