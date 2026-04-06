import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Wrench } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import type { OSItem } from '@/types/database';

interface Props {
  itens: OSItem[];
  loading: boolean;
  valorPecas: number;
  valorMaoObra: number;
  desconto: number;
  valorTotal: number;
  onAdicionarPeca: () => void;
  onAdicionarServico: () => void;
  onRemover: (id: string) => void;
  onDescontoChange: (v: number) => void;
}

export function OSItensTab({ itens, loading, valorPecas, valorMaoObra, desconto, valorTotal, onAdicionarPeca, onAdicionarServico, onRemover, onDescontoChange }: Props) {
  const [tipoDesconto, setTipoDesconto] = useState<'valor' | 'percentual'>('valor');
  const [descontoInput, setDescontoInput] = useState(desconto > 0 ? String(desconto) : '');

  const subtotal = valorPecas + valorMaoObra;

  const handleDescontoChange = (val: string) => {
    setDescontoInput(val);
    const num = parseFloat(val) || 0;
    if (tipoDesconto === 'percentual') {
      onDescontoChange(Math.round((subtotal * num / 100) * 100) / 100);
    } else {
      onDescontoChange(num);
    }
  };

  const handleTipoChange = (tipo: 'valor' | 'percentual') => {
    setTipoDesconto(tipo);
    setDescontoInput('');
    onDescontoChange(0);
  };

  if (loading) return <LoadingState variant="table" />;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {itens.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">Nenhum item adicionado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-4 py-2 font-semibold">Tipo</th>
                <th className="text-left px-4 py-2 font-semibold">Descrição</th>
                <th className="text-center px-4 py-2 font-semibold">Qtd</th>
                <th className="text-right px-4 py-2 font-semibold">Unit.</th>
                <th className="text-right px-4 py-2 font-semibold">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Badge variant="secondary" className={`text-[10px] ${item.tipo === 'peca' ? 'bg-accent-light text-accent' : 'bg-purple-light text-purple'}`}>
                      {item.tipo === 'peca' ? 'Peça' : 'Serviço'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.descricao}</td>
                  <td className="px-4 py-2 text-center text-sm font-mono">{item.quantidade}</td>
                  <td className="px-4 py-2 text-right text-sm font-mono">{formatarMoeda(item.valor_unitario)}</td>
                  <td className="px-4 py-2 text-right text-sm font-mono font-medium">{formatarMoeda(item.valor_total)}</td>
                  <td className="px-2 py-2">
                    <button onClick={() => onRemover(item.id)} className="p-1 text-muted-foreground hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onAdicionarPeca} className="gap-1"><Plus className="h-3.5 w-3.5" /> Peça</Button>
        <Button variant="outline" size="sm" onClick={onAdicionarServico} className="gap-1"><Wrench className="h-3.5 w-3.5" /> Serviço</Button>
      </div>

      <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Peças</span><MoneyDisplay valor={valorPecas} /></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mão de Obra</span><MoneyDisplay valor={valorMaoObra} /></div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-muted-foreground">Desconto</span>
          <div className="flex items-center gap-1">
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => handleTipoChange('valor')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${tipoDesconto === 'valor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >R$</button>
              <button
                onClick={() => handleTipoChange('percentual')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${tipoDesconto === 'percentual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >%</button>
            </div>
            <Input type="number" min="0" step="0.01" value={descontoInput} onChange={(e) => handleDescontoChange(e.target.value)}
              placeholder={tipoDesconto === 'percentual' ? '0%' : 'R$ 0,00'}
              className="w-24 h-8 text-right font-mono text-sm" />
            {tipoDesconto === 'percentual' && desconto > 0 && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">= {formatarMoeda(desconto)}</span>
            )}
          </div>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-display font-bold text-foreground">TOTAL</span>
          <MoneyDisplay valor={valorTotal} className="text-xl font-display font-bold" />
        </div>
      </div>
    </div>
  );
}
