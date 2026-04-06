import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. A mudança é imediata.' },
  { q: 'O que acontece quando meu plano vence?', a: 'Você tem 15 dias de tolerância para renovar. Durante esse período, o sistema funciona normalmente. Após os 15 dias, o acesso fica em modo somente leitura.' },
  { q: 'Posso cancelar minha assinatura?', a: 'Sim. Entre em contato conosco via WhatsApp para solicitar o cancelamento. Seus dados ficam armazenados por 90 dias.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Sim! Planos anuais têm desconto de 20%. Entre em contato para saber mais.' },
  { q: 'Como funciona o suporte prioritário?', a: 'Planos Premium têm atendimento via WhatsApp com tempo de resposta de até 2 horas em horário comercial.' },
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
