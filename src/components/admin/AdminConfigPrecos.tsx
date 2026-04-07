import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, DollarSign, Percent, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'admin-precos-config';

export interface PrecosConfig {
  valorMensal: number;
  oferecerAnual: boolean;
  descontoAnual: number;
}

const DEFAULTS: PrecosConfig = {
  valorMensal: 19.9,
  oferecerAnual: true,
  descontoAnual: 10,
};

export function getAdminPrecos(): PrecosConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULTS;
}

export function AdminConfigPrecos() {
  const [config, setConfig] = useState<PrecosConfig>(DEFAULTS);

  useEffect(() => {
    setConfig(getAdminPrecos());
  }, []);

  const valorAnualSemDesconto = config.valorMensal * 12;
  const valorAnualComDesconto = valorAnualSemDesconto * (1 - config.descontoAnual / 100);

  const handleSalvar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast({ title: 'Preços salvos com sucesso!' });
  };

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-5">
        {/* Valor mensal */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label className="text-slate-300 flex items-center gap-1.5 mb-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Valor Mensal (R$)
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={config.valorMensal}
              onChange={(e) => setConfig((p) => ({ ...p, valorMensal: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Toggle anual */}
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">Oferecer plano anual com desconto</Label>
          <Switch
            checked={config.oferecerAnual}
            onCheckedChange={(v) => setConfig((p) => ({ ...p, oferecerAnual: v }))}
          />
        </div>

        {config.oferecerAnual && (
          <div className="space-y-3 pl-1 border-l-2 border-blue-500/30 ml-1 py-1">
            <div>
              <Label className="text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Percent className="h-3.5 w-3.5" /> Desconto anual (%)
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                max="50"
                value={config.descontoAnual}
                onChange={(e) => setConfig((p) => ({ ...p, descontoAnual: parseFloat(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white w-32"
              />
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Calculator className="h-3.5 w-3.5" /> Preview do plano anual
              </div>
              <div className="text-sm text-slate-300">
                {formatBRL(config.valorMensal)} × 12 = <span className="line-through text-slate-500">{formatBRL(valorAnualSemDesconto)}</span>
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {formatBRL(valorAnualComDesconto)}/ano
              </div>
              <div className="text-xs text-slate-500">
                Equivale a {formatBRL(valorAnualComDesconto / 12)}/mês
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSalvar}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          Salvar Preços
        </Button>
      </div>
  );
}
