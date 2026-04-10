import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { formatarMoeda } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { FileText, Package } from 'lucide-react';
import type { NFDraftFromOS } from '@/hooks/useNF';

interface Props {
  open: boolean;
  onClose: () => void;
  onEmitir: (data: { tipo: 'servico' | 'produto'; valor: number; destinatario_nome?: string; destinatario_cpf_cnpj?: string; os_id?: string }) => void;
  clientes: { id: string; nome: string; cpf_cnpj?: string }[];
  osDraft?: NFDraftFromOS;
}

export function NFForm({ open, onClose, onEmitir, clientes, osDraft }: Props) {
  const [tipo, setTipo] = useState<'servico' | 'produto'>('servico');
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (osDraft && open) {
      setTipo(osDraft.tipo);
      setValor(String(osDraft.valor));
      const cli = clientes.find(c => c.nome === osDraft.destinatario_nome);
      if (cli) setClienteId(cli.id);
    }
  }, [osDraft, open, clientes]);

  const clienteOptions = clientes.map(c => ({ value: c.id, label: c.nome }));
  const selectedCliente = clientes.find(c => c.id === clienteId);

  const handleEmitir = () => {
    if (!valor) return;
    onEmitir({
      tipo, valor: parseFloat(valor),
      destinatario_nome: selectedCliente?.nome,
      destinatario_cpf_cnpj: selectedCliente?.cpf_cnpj,
      os_id: osDraft?.os_id,
    });
    onClose();
    setTipo('servico'); setClienteId(''); setValor(''); setObs('');
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Emitir Comprovante</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {osDraft && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-semibold text-foreground">📋 OS #{osDraft.os_numero}</p>
              <p className="text-muted-foreground">{osDraft.destinatario_nome} · {osDraft.veiculo}</p>
              <p className="text-muted-foreground">{osDraft.itens.length} itens · {formatarMoeda(osDraft.valor)}</p>
            </div>
          )}

          <div className="flex gap-2">
            {(['servico', 'produto'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTipo(t)}
                className={cn('flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all cursor-pointer',
                  tipo === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                {t === 'servico' ? <FileText className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                {t === 'servico' ? 'Serviço' : 'Produto'}
              </button>
            ))}
          </div>

          <div><Label>Cliente</Label>
            <SearchableSelect value={clienteId} onValueChange={setClienteId} options={clienteOptions} placeholder="Selecione o cliente" />
          </div>

          <div><Label>Valor Total (R$)</Label>
            <Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="min-h-[44px] font-mono text-lg" />
            {valor && <MoneyDisplay valor={parseFloat(valor) || 0} className="text-accent mt-1 block" />}
          </div>

          <div><Label>Observações (opcional)</Label>
            <Textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Informações adicionais..." />
          </div>

          <Button onClick={handleEmitir} className="w-full min-h-[48px] bg-success hover:bg-success/90 text-success-foreground text-base font-bold" disabled={!clienteId || !valor}>
            ✅ Gerar Comprovante
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
