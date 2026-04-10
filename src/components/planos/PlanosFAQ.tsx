import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'O que acontece quando meu plano vence?', a: 'Você tem 15 dias de tolerância para renovar. Durante esse período, o sistema funciona normalmente. Após os 15 dias, o acesso fica em modo somente leitura.' },
  { q: 'Posso cancelar minha assinatura?', a: 'Sim. Entre em contato conosco via WhatsApp para solicitar o cancelamento. Seus dados ficam armazenados por 90 dias.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Sim! O plano anual sai por R$ 209,90 — uma economia de mais de R$ 28 comparado ao mensal.' },
  { q: 'Quantos funcionários posso cadastrar?', a: 'Ilimitados! Não há limite de funcionários no Plano Completo.' },
  { q: 'Em quais dispositivos funciona?', a: 'Web (navegador), aplicativo desktop (Windows/Mac) e celular (PWA).' },
  { q: 'Como funciona o suporte?', a: 'Suporte via WhatsApp com resposta rápida para todos os assinantes.' },
];

export function PlanosFAQ() {
  return (
    <div className="mt-8">
      <h3 className="font-display font-bold text-lg mb-4">Perguntas Frequentes</h3>
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
