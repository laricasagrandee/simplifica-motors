import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
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

  const cats = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  const catOptions = cats.map((c) => ({ value: c, label: CATEGORIAS_LABELS[c] ?? c }));

  const handleSalvar = () => {
    if (!categoria || !descricao || !valor) return;
    onSalvar({
      tipo, categoria, descricao, valor: parseFloat(valor),
      forma_pagamento: formaPgto, data,
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
          <div className="flex gap-2">
            <Button variant={tipo === 'entrada' ? 'default' : 'outline'} className={tipo === 'entrada' ? 'bg-success text-white' : ''} onClick={() => setTipo('entrada')}>Entrada</Button>
            <Button variant={tipo === 'saida' ? 'default' : 'outline'} className={tipo === 'saida' ? 'bg-destructive text-white' : ''} onClick={() => setTipo('saida')}>Saída</Button>
          </div>

          <div><Label>Categoria</Label>
            <SearchableSelect value={categoria} onValueChange={setCategoria} options={catOptions} placeholder="Selecione" />
          </div>

          <div><Label>Descrição</Label>
            <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição..." className="min-h-[44px]" />
          </div>

          <div><Label>Valor (R$)</Label>
            <Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="min-h-[44px] font-mono" />
          </div>

          <div><Label>Forma de Pagamento</Label>
            <SearchableSelect value={formaPgto} onValueChange={v => setFormaPgto(v as FormaPagamento)} options={formaOptions} placeholder="Selecione" />
          </div>

          <div><Label>Data</Label>
            <DatePick value={data} onChange={setData} />
          </div>

          <div><Label>Data de Vencimento (opcional)</Label>
            <DatePick value={dataVenc} onChange={setDataVenc} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={pago} onCheckedChange={setPago} />
            <Label>Já foi pago?</Label>
          </div>

          <Button onClick={handleSalvar} className="w-full min-h-[44px] bg-accent text-accent-foreground" disabled={!categoria || !descricao || !valor}>
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
