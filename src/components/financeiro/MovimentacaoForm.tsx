import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FORMAS_PAGAMENTO } from '@/lib/constants';
import { CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA, CATEGORIAS_LABELS } from './financeiroConstants';
import type { FormaPagamento } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  onSalvar: (data: any) => void;
}

const formaOptions = Object.entries(FORMAS_PAGAMENTO).map(([k, v]) => ({ value: k, label: v }));

export function MovimentacaoForm({ open, onClose, onSalvar }: Props) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPgto, setFormaPgto] = useState<FormaPagamento>('dinheiro');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataVenc, setDataVenc] = useState('');
  const [pago, setPago] = useState(true);
  const [maisDetalhes, setMaisDetalhes] = useState(false);

  const cats = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  const catOptions = cats.map((c) => ({ value: c, label: CATEGORIAS_LABELS[c] ?? c }));

  const handleSalvar = () => {
    if (!descricao.trim() || !valor) return;
    onSalvar({
      tipo, 
      categoria: categoria || 'outros', 
      descricao, 
      valor: parseFloat(valor),
      forma_pagamento: formaPgto, 
      data,
      data_vencimento: dataVenc || undefined,
      pago,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {/* Tipo - obrigatório */}
          <div className="flex gap-2">
            <Button variant={tipo === 'entrada' ? 'default' : 'outline'} className={cn('flex-1 min-h-[48px] text-base', tipo === 'entrada' && 'bg-emerald-600 hover:bg-emerald-700 text-white')} onClick={() => setTipo('entrada')}>Entrada</Button>
            <Button variant={tipo === 'saida' ? 'default' : 'outline'} className={cn('flex-1 min-h-[48px] text-base', tipo === 'saida' && 'bg-destructive hover:bg-destructive/90 text-white')} onClick={() => setTipo('saida')}>Saída</Button>
          </div>

          {/* Valor - obrigatório, com foco */}
          <div><Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="min-h-[48px] font-mono text-lg" autoFocus />
          </div>

          {/* Descrição - obrigatório */}
          <div><Label>Descrição *</Label>
            <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Compra de peças" className="min-h-[44px]" />
          </div>

          {/* Mais detalhes - expansível */}
          <button onClick={() => setMaisDetalhes(!maisDetalhes)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            {maisDetalhes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {maisDetalhes ? 'Menos detalhes' : 'Mais detalhes'}
          </button>

          {maisDetalhes && (
            <div className="space-y-4 border-t border-border pt-4">
              <div><Label>Categoria</Label>
                <SearchableSelect value={categoria} onValueChange={setCategoria} options={catOptions} placeholder="Outros" />
              </div>

              <div><Label>Forma de Pagamento</Label>
                <SearchableSelect value={formaPgto} onValueChange={v => setFormaPgto(v as FormaPagamento)} options={formaOptions} placeholder="Dinheiro" />
              </div>

              <div><Label>Data</Label>
                <DatePick value={data} onChange={setData} />
              </div>

              <div><Label>Data de Vencimento</Label>
                <DatePick value={dataVenc} onChange={setDataVenc} />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={pago} onCheckedChange={setPago} />
                <Label>Já foi pago?</Label>
              </div>
            </div>
          )}

          <Button onClick={handleSalvar} className="w-full min-h-[48px] text-base" disabled={!descricao.trim() || !valor}>
            Registrar Movimentação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DatePick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value + 'T12:00:00') : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('w-full min-h-[44px] justify-start text-left font-normal', !value && 'text-muted-foreground')}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value || 'Selecionar data'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={d => d && onChange(format(d, 'yyyy-MM-dd'))} className={cn('p-3 pointer-events-auto')} />
      </PopoverContent>
    </Popover>
  );
}
