import { ShieldAlert, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPORTE_WHATSAPP, SUPORTE_NOME } from '@/lib/constants';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useCreateCheckout, usePlanoPrecos } from '@/hooks/useStripe';
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
  const [selectedIntervalo, setSelectedIntervalo] = useState<string | null>(null);
  const nomeOficina = config?.nome_fantasia || '';

  const mensagem = encodeURIComponent(
    `Olá! Preciso regularizar meu acesso ao ${SUPORTE_NOME}.${nomeOficina ? ` Oficina: ${nomeOficina}` : ''}`
  );
  const whatsappLink = `https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagem}`;

  const mensal = precos?.find(p => p.slug === 'completo' && p.intervalo === 'mensal');
  const anual = precos?.find(p => p.slug === 'completo' && p.intervalo === 'anual');

  const handleAssinar = (intervalo: string) => {
    setSelectedIntervalo(intervalo);
    checkout.mutate({ slug: 'completo', intervalo });
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
        Seu período de teste acabou ou há pendência financeira. Assine o plano para continuar usando o sistema.
      </p>

      {/* Plano Completo */}
      {precosLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-6" />
      ) : (mensal || anual) ? (
        <div className="rounded-xl border border-primary ring-2 ring-primary/20 p-6 max-w-sm w-full mb-6 space-y-3">
          <h3 className="font-display font-bold text-lg">Plano Completo</h3>
          <p className="text-xs text-muted-foreground">Funcionários ilimitados • Web, Desktop e Mobile</p>

          {mensal && mensal.stripe_price_id && (
            <Button
              onClick={() => handleAssinar('mensal')}
              disabled={checkout.isPending}
              className="w-full min-h-[44px]"
            >
              {checkout.isPending && selectedIntervalo === 'mensal' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {formatBRL(mensal.valor_centavos)}/mês
            </Button>
          )}

          {anual && anual.stripe_price_id && (
            <Button
              onClick={() => handleAssinar('anual')}
              disabled={checkout.isPending}
              variant="outline"
              className="w-full min-h-[44px] text-sm"
            >
              {checkout.isPending && selectedIntervalo === 'anual' ? (
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
