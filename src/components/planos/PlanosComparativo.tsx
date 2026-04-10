import { Loader2, CreditCard, CheckCircle, Laptop, Monitor, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlanoPrecos, useCreateCheckout, useCustomerPortal } from '@/hooks/useStripe';
import { useState } from 'react';

interface Props { planoAtual: string; onAssinar?: (plano: string) => void; }

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const FEATURES = [
  'Funcionários ilimitados',
  'OS ilimitadas',
  'PDV integrado',
  'Financeiro completo (DRE, CMV)',
  'Relatórios avançados',
  'Agendamentos',
  'Emissão de NF',
  'Estoque com QR Code',
  'Suporte via WhatsApp',
  'Acesso Web + Desktop + Mobile',
];

export function PlanosComparativo({ planoAtual }: Props) {
  const { data: precos, isLoading } = usePlanoPrecos();
  const checkout = useCreateCheckout();
  const portal = useCustomerPortal();
  const [intervalo, setIntervalo] = useState<'mensal' | 'anual'>('mensal');

  const preco = precos?.find(p => p.slug === 'completo' && p.intervalo === intervalo);
  const precoMensal = precos?.find(p => p.slug === 'completo' && p.intervalo === 'mensal');
  const precoAnual = precos?.find(p => p.slug === 'completo' && p.intervalo === 'anual');
  const isAtual = planoAtual === 'completo';

  const economiaAnual = precoMensal && precoAnual
    ? (precoMensal.valor_centavos * 12) - precoAnual.valor_centavos
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Toggle mensal/anual */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={intervalo === 'mensal' ? 'default' : 'outline'}
          onClick={() => setIntervalo('mensal')}
          size="sm"
        >
          Mensal
        </Button>
        <Button
          variant={intervalo === 'anual' ? 'default' : 'outline'}
          onClick={() => setIntervalo('anual')}
          size="sm"
        >
          Anual
          {economiaAnual > 0 && (
            <Badge className="bg-accent/20 text-accent ml-1 text-xs">-{formatBRL(economiaAnual)}</Badge>
          )}
        </Button>
      </div>

      <Card className="border-primary ring-2 ring-primary/20">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="font-bold text-xl mb-1">Plano Completo</h3>
            <div className="flex items-center justify-center gap-3 mb-1">
              <Laptop className="h-4 w-4 text-muted-foreground" />
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Web • Desktop • Mobile</p>
          </div>

          {preco ? (
            <div className="text-center">
              <p className="font-mono text-3xl font-bold text-primary">
                {formatBRL(preco.valor_centavos)}
                <span className="text-sm text-muted-foreground font-normal">
                  /{intervalo === 'mensal' ? 'mês' : 'ano'}
                </span>
              </p>
              {intervalo === 'anual' && precoMensal && (
                <p className="text-xs text-muted-foreground">
                  Equivale a {formatBRL(Math.round(preco.valor_centavos / 12))}/mês
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Indisponível</p>
          )}

          <ul className="space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {isAtual ? (
            <Button variant="outline" className="w-full min-h-[44px]" disabled>
              Plano Atual
            </Button>
          ) : preco?.stripe_price_id ? (
            <Button
              onClick={() => checkout.mutate({ slug: 'completo', intervalo })}
              disabled={checkout.isPending}
              className="w-full min-h-[44px]"
            >
              {checkout.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Assinar agora
            </Button>
          ) : (
            <Button variant="outline" className="w-full min-h-[44px]" disabled>
              Em breve
            </Button>
          )}
        </CardContent>
      </Card>

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
