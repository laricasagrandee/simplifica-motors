import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt } from 'lucide-react';
import type { TaxasParcelamento } from '@/types/database';

const DEFAULT_TAXAS: TaxasParcelamento = {
  '2': 3.9, '3': 4.9, '4': 5.9, '5': 6.9, '6': 7.9,
  '7': 8.9, '8': 9.9, '9': 10.9, '10': 11.9, '11': 12.9, '12': 13.9,
};

interface Props {
  aliquota: number;
  taxaDebito: number;
  taxaCredito: number;
  taxasParcelamento: TaxasParcelamento | null;
  onSalvar: (v: {
    aliquota_imposto: number;
    taxa_cartao_debito: number;
    taxa_cartao_credito: number;
    taxas_parcelamento: TaxasParcelamento;
  }) => void;
}

export function ConfigImpostos({ aliquota, taxaDebito, taxaCredito, taxasParcelamento, onSalvar }: Props) {
  const [valor, setValor] = useState(String(aliquota || 6));
  const [debito, setDebito] = useState(String(taxaDebito));
  const [credito, setCredito] = useState(String(taxaCredito));
  const [parcTaxas, setParcTaxas] = useState<TaxasParcelamento>(taxasParcelamento ?? DEFAULT_TAXAS);

  const updateParcela = (key: string, val: string) => {
    setParcTaxas(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Impostos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Alíquota de Imposto (%)</Label>
            <Input type="number" step="0.5" value={valor} onChange={e => setValor(e.target.value)} className="min-h-[44px] font-mono max-w-[200px]" />
            <p className="text-xs text-muted-foreground mt-1">Alíquota estimada para cálculo do DRE</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Taxas de Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Configure as taxas da maquininha. O valor líquido será calculado automaticamente no caixa.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Débito (%)</Label>
              <Input type="number" step="0.01" min="0" max="100" value={debito} onChange={e => setDebito(e.target.value)} className="min-h-[44px] font-mono" />
            </div>
            <div>
              <Label>Crédito à vista (%)</Label>
              <Input type="number" step="0.01" min="0" max="100" value={credito} onChange={e => setCredito(e.target.value)} className="min-h-[44px] font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            💳 Taxas de Parcelamento
          </CardTitle>
          <p className="text-xs text-muted-foreground">Configure as taxas do cartão para cada quantidade de parcelas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {Array.from({ length: 11 }, (_, i) => String(i + 2)).map(key => (
              <div
                key={key}
                className="flex items-center gap-3 border border-border rounded-lg px-4 py-2.5 hover:bg-muted/30 transition-colors"
              >
                <span className="font-semibold text-sm w-8">{key}x</span>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={parcTaxas[key] ?? DEFAULT_TAXAS[key] ?? ''}
                  onChange={e => updateParcela(key, e.target.value)}
                  className="w-24 font-mono h-9"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <div className="flex-1" />
                <Badge variant="secondary" className="text-[10px]">Padrão</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => onSalvar({
          aliquota_imposto: parseFloat(valor) || 6,
          taxa_cartao_debito: parseFloat(debito) || 1.99,
          taxa_cartao_credito: parseFloat(credito) || 3.49,
          taxas_parcelamento: parcTaxas,
        })}
        className="min-h-[44px] w-full sm:w-auto"
      >
        Salvar Impostos e Taxas
      </Button>
    </div>
  );
}
