import { ShieldAlert, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPORTE_WHATSAPP, SUPORTE_NOME } from '@/lib/constants';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useCreateCheckout, usePlanoPrecos } from '@/hooks/useStripe';
import { PLANO_LABELS, type PlanoSlug } from '@/lib/planos';
import { useState } from 'react';

function formatarTelefone(num: string) {
  const clean = num.replace(/\D/g, '');
  if (clean.length === 13) {
    return `(${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  return num;
}

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function BloqueioScreen() {
  const { data: config } = useConfiguracoes();
  const { data: precos, isLoading: precosLoading } = usePlanoPrecos();
  const checkout = useCreateCheckout();
  const [selectedPlan, setSelectedPlan] = useState<{ slug: string; intervalo: string } | null>(null);
  const nomeOficina = config?.nome_fantasia || '';

  const mensagem = encodeURIComponent(
    `Olá! Preciso regularizar meu acesso ao ${SUPORTE_NOME}.${nomeOficina ? ` Oficina: ${nomeOficina}` : ''}`
  );
  const whatsappLink = `https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagem}`;

  // Agrupar preços por slug
  const planosBySlug = (precos || []).reduce((acc, p) => {
    if (!acc[p.slug]) acc[p.slug] = {};
    acc[p.slug][p.intervalo] = p;
    return acc;
  }, {} as Record<string, Record<string, typeof precos extends (infer T)[] ? T : never>>);

  const slugOrder: PlanoSlug[] = ['basico', 'profissional', 'premium'];
  const planosDisponiveis = slugOrder.filter(s => planosBySlug[s]);

  const handleAssinar = (slug: string, intervalo: string) => {
    setSelectedPlan({ slug, intervalo });
    checkout.mutate({ slug, intervalo });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-baseline gap-0.5 mb-6">
        <span className="font-display font-extrabold text-3xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-3xl text-primary">Motors</span>
      </div>
      <div className="rounded-full p-6 mb-6 bg-destructive/10">
        <ShieldAlert className="h-12 w-12 text-destructive" strokeWidth={1.5} />
      </div>
      <h1 className="font-display font-bold text-2xl mb-2">Acesso suspenso</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Seu período de teste acabou ou há pendência financeira. Escolha um plano para continuar usando o sistema.
      </p>

      {/* Planos */}
      {precosLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-6" />
      ) : planosDisponiveis.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mb-6">
          {planosDisponiveis.map(slug => {
            const mensal = planosBySlug[slug]?.mensal;
            const anual = planosBySlug[slug]?.anual;
            const label = PLANO_LABELS[slug] || slug;
            const isRecomendado = slug === 'profissional';

            return (
              <div key={slug} className={`rounded-xl border p-4 space-y-3 ${isRecomendado ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'}`}>
                {isRecomendado && (
                  <span className="inline-block text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Recomendado
                  </span>
                )}
                <h3 className="font-display font-bold text-lg capitalize">{label}</h3>

                {mensal && mensal.stripe_price_id && (
                  <Button
                    onClick={() => handleAssinar(slug, 'mensal')}
                    disabled={checkout.isPending}
                    variant={isRecomendado ? 'default' : 'outline'}
                    className="w-full min-h-[44px]"
                  >
                    {checkout.isPending && selectedPlan?.slug === slug && selectedPlan?.intervalo === 'mensal' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {formatBRL(mensal.valor_centavos)}/mês
                  </Button>
                )}

                {anual && anual.stripe_price_id && (
                  <Button
                    onClick={() => handleAssinar(slug, 'anual')}
                    disabled={checkout.isPending}
                    variant="outline"
                    className="w-full min-h-[44px] text-sm"
                  >
                    {checkout.isPending && selectedPlan?.slug === slug && selectedPlan?.intervalo === 'anual' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {formatBRL(anual.valor_centavos)}/ano
                    {mensal && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({Math.round((1 - anual.valor_centavos / (mensal.valor_centavos * 12)) * 100)}% off)
                      </span>
                    )}
                  </Button>
                )}

                {(!mensal?.stripe_price_id && !anual?.stripe_price_id) && (
                  <p className="text-xs text-muted-foreground">Em breve</p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* WhatsApp */}
      <div className="bg-muted rounded-lg p-4 max-w-sm mb-6">
        <p className="text-sm font-medium mb-1">WhatsApp de Suporte</p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-accent font-mono font-bold text-lg">
          {formatarTelefone(SUPORTE_WHATSAPP)}
        </a>
      </div>
    </div>
  );
}
