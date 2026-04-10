import { Check, X, Loader2, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlanoPrecos, useCreateCheckout, useCustomerPortal } from '@/hooks/useStripe';
import { PLANO_LABELS, type PlanoSlug } from '@/lib/planos';
import { useState } from 'react';

interface Props { planoAtual: string; onAssinar?: (plano: string) => void; }

const FEATURES: Record<string, { texto: string; planos: string[] }[]> = {
  basico: [
    { texto: 'Até 3 funcionários', planos: ['basico', 'profissional', 'premium'] },
    { texto: 'OS e PDV', planos: ['basico', 'profissional', 'premium'] },
    { texto: 'Financeiro básico', planos: ['basico', 'profissional', 'premium'] },
    { texto: 'Relatórios', planos: ['profissional', 'premium'] },
    { texto: 'NF automática', planos: ['profissional', 'premium'] },
    { texto: 'Suporte prioritário', planos: ['premium'] },
  ],
};

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PlanosComparativo({ planoAtual }: Props) {
  const { data: precos, isLoading } = usePlanoPrecos();
  const checkout = useCreateCheckout();
  const portal = useCustomerPortal();
  const [selected, setSelected] = useState<{ slug: string; intervalo: string } | null>(null);
  const [intervaloSelecionado, setIntervaloSelecionado] = useState<'mensal' | 'anual'>('mensal');

  const slugOrder: PlanoSlug[] = ['basico', 'profissional', 'premium'];

  const grouped = (precos || []).reduce((acc, p) => {
    if (!acc[p.slug]) acc[p.slug] = {};
    acc[p.slug][p.intervalo] = p;
    return acc;
  }, {} as Record<string, Record<string, (typeof precos extends (infer T)[] ? T : never)>>);

  const features = [
    { texto: 'Até 3 funcionários', planos: ['basico'] },
    { texto: 'Até 10 funcionários', planos: ['profissional'] },
    { texto: 'Funcionários ilimitados', planos: ['premium'] },
    { texto: 'OS e PDV', planos: ['basico', 'profissional', 'premium'] },
    { texto: 'Financeiro completo', planos: ['profissional', 'premium'] },
    { texto: 'Financeiro básico', planos: ['basico'] },
    { texto: 'Relatórios', planos: ['profissional', 'premium'] },
    { texto: 'NF automática', planos: ['profissional', 'premium'] },
    { texto: 'Suporte prioritário', planos: ['premium'] },
  ];

  const handleAssinar = (slug: string) => {
    setSelected({ slug, intervalo: intervaloSelecionado });
    checkout.mutate({ slug, intervalo: intervaloSelecionado });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle mensal/anual */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={intervaloSelecionado === 'mensal' ? 'default' : 'outline'}
          onClick={() => setIntervaloSelecionado('mensal')}
          size="sm"
        >
          Mensal
        </Button>
        <Button
          variant={intervaloSelecionado === 'anual' ? 'default' : 'outline'}
          onClick={() => setIntervaloSelecionado('anual')}
          size="sm"
        >
          Anual
          <Badge className="bg-accent/20 text-accent ml-1 text-xs">Economia</Badge>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slugOrder.map(slug => {
          const preco = grouped[slug]?.[intervaloSelecionado];
          const precomensal = grouped[slug]?.mensal;
          const isRecomendado = slug === 'profissional';
          const isAtual = planoAtual === slug;
          const label = PLANO_LABELS[slug] || slug;
          const temStripe = !!preco?.stripe_price_id;

          const featuresDoPlano = features.filter(f => f.planos.includes(slug));
          const featuresNaoInclusas = features.filter(f => !f.planos.includes(slug));

          return (
            <Card key={slug} className={isRecomendado ? 'border-accent shadow-md ring-2 ring-accent/20' : ''}>
              <CardHeader className="text-center pb-2">
                {isRecomendado && <Badge className="bg-accent text-accent-foreground mx-auto mb-2">Recomendado</Badge>}
                <CardTitle className="capitalize text-lg">{label}</CardTitle>
                {preco ? (
                  <div>
                    <p className="font-mono text-3xl font-bold text-accent">
                      {formatBRL(preco.valor_centavos)}
                      <span className="text-sm text-muted-foreground font-normal">
                        /{intervaloSelecionado === 'mensal' ? 'mês' : 'ano'}
                      </span>
                    </p>
                    {intervaloSelecionado === 'anual' && precomensal && (
                      <p className="text-xs text-muted-foreground">
                        Equivale a {formatBRL(preco.valor_centavos / 12)}/mês
                        {' '}({Math.round((1 - preco.valor_centavos / (precomensal.valor_centavos * 12)) * 100)}% off)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Indisponível</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {featuresDoPlano.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>{f.texto}</span>
                  </div>
                ))}
                {featuresNaoInclusas.slice(0, 2).map((f, i) => (
                  <div key={`no-${i}`} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{f.texto}</span>
                  </div>
                ))}

                {isAtual ? (
                  <Button variant="outline" className="w-full min-h-[44px] mt-4" disabled>
                    Plano Atual
                  </Button>
                ) : temStripe ? (
                  <Button
                    onClick={() => handleAssinar(slug)}
                    disabled={checkout.isPending}
                    className="w-full min-h-[44px] mt-4"
                    variant={isRecomendado ? 'default' : 'outline'}
                  >
                    {checkout.isPending && selected?.slug === slug ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Assinar
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full min-h-[44px] mt-4" disabled>
                    Em breve
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gerenciar assinatura */}
      {planoAtual !== 'teste' && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={() => portal.mutate()}
            disabled={portal.isPending}
            className="text-sm text-muted-foreground"
          >
            {portal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Gerenciar assinatura existente
          </Button>
        </div>
      )}
    </div>
  );
}
