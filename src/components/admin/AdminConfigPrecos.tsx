import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Loader2, Save, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PLANO_LABELS, type PlanoSlug } from '@/lib/planos';

interface PlanoPrecoRow {
  id: string;
  slug: string;
  intervalo: string;
  valor_centavos: number;
  stripe_price_id: string | null;
  ativo: boolean;
  max_funcionarios: number;
}

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function AdminConfigPrecos() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, Partial<PlanoPrecoRow>>>({});

  const { data: precos, isLoading } = useQuery<PlanoPrecoRow[]>({
    queryKey: ['admin-plano-precos'],
    queryFn: async () => {
      // Use service role via edge function or direct query
      const { data, error } = await supabase
        .from('plano_precos')
        .select('*')
        .order('valor_centavos');
      if (error) throw error;
      return (data ?? []) as unknown as PlanoPrecoRow[];
    },
  });

  const getEdit = (id: string, field: keyof PlanoPrecoRow, original: PlanoPrecoRow) => {
    return edits[id]?.[field] ?? original[field];
  };

  const setEdit = (id: string, field: keyof PlanoPrecoRow, value: unknown) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      for (const [id, changes] of Object.entries(edits)) {
        if (Object.keys(changes).length === 0) continue;
        const updateData: Record<string, unknown> = { ...changes, atualizado_em: new Date().toISOString() };
        const { error } = await supabase
          .from('plano_precos')
          .update(updateData as any)
          .eq('id', id);
        if (error) throw error;
      }
      setEdits({});
      queryClient.invalidateQueries({ queryKey: ['admin-plano-precos'] });
      queryClient.invalidateQueries({ queryKey: ['plano-precos'] });
      toast({ title: 'Preços atualizados!' });
    } catch (err: unknown) {
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-blue-400 mx-auto" />;

  const slugOrder: PlanoSlug[] = ['basico', 'profissional', 'premium'];
  const grouped = (precos || []).reduce((acc, p) => {
    if (!acc[p.slug]) acc[p.slug] = {};
    acc[p.slug][p.intervalo] = p;
    return acc;
  }, {} as Record<string, Record<string, PlanoPrecoRow>>);

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="space-y-5">
      {slugOrder.map(slug => {
        const label = PLANO_LABELS[slug] || slug;
        const mensal = grouped[slug]?.mensal;
        const anual = grouped[slug]?.anual;

        return (
          <div key={slug} className="space-y-3">
            <h4 className="text-white font-bold capitalize flex items-center gap-2">
              {label}
              {mensal?.stripe_price_id ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Stripe OK</Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">Sem Stripe</Badge>
              )}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Mensal */}
              {mensal && (
                <div>
                  <Label className="text-slate-400 text-xs">Mensal (centavos)</Label>
                  <Input
                    type="number"
                    value={getEdit(mensal.id, 'valor_centavos', mensal) as number}
                    onChange={e => setEdit(mensal.id, 'valor_centavos', parseInt(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <span className="text-xs text-slate-500">{formatBRL(getEdit(mensal.id, 'valor_centavos', mensal) as number)}/mês</span>
                </div>
              )}

              {/* Anual */}
              {anual && (
                <div>
                  <Label className="text-slate-400 text-xs">Anual (centavos)</Label>
                  <Input
                    type="number"
                    value={getEdit(anual.id, 'valor_centavos', anual) as number}
                    onChange={e => setEdit(anual.id, 'valor_centavos', parseInt(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <span className="text-xs text-slate-500">{formatBRL(getEdit(anual.id, 'valor_centavos', anual) as number)}/ano</span>
                </div>
              )}
            </div>

            {/* Stripe Price ID */}
            {mensal && (
              <div>
                <Label className="text-slate-400 text-xs">Stripe Price ID (mensal)</Label>
                <Input
                  value={(getEdit(mensal.id, 'stripe_price_id', mensal) as string) || ''}
                  onChange={e => setEdit(mensal.id, 'stripe_price_id', e.target.value || null)}
                  placeholder="price_..."
                  className="bg-slate-700 border-slate-600 text-white text-sm font-mono"
                />
              </div>
            )}
            {anual && (
              <div>
                <Label className="text-slate-400 text-xs">Stripe Price ID (anual)</Label>
                <Input
                  value={(getEdit(anual.id, 'stripe_price_id', anual) as string) || ''}
                  onChange={e => setEdit(anual.id, 'stripe_price_id', e.target.value || null)}
                  placeholder="price_..."
                  className="bg-slate-700 border-slate-600 text-white text-sm font-mono"
                />
              </div>
            )}
          </div>
        );
      })}

      <Button
        onClick={handleSalvar}
        disabled={!hasEdits || saving}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar Preços
      </Button>

      <a
        href="https://dashboard.stripe.com/products"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
      >
        <ExternalLink className="h-3 w-3" /> Gerenciar produtos no Stripe Dashboard
      </a>
    </div>
  );
}
