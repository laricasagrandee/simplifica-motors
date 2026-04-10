import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ShoppingCart, DollarSign, BarChart3, Package, CalendarDays,
  CheckCircle, Star, ChevronDown, ChevronUp, ArrowRight, Users, Shield, Zap,
  Clock, FileText, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanoPrecos, type PlanoPreco } from '@/hooks/useStripe';
import { useAppSetting } from '@/modules/license/services/useAppSettings';

const BENEFICIOS = [
  { icon: Wrench, titulo: 'Ordens de Serviço', desc: 'Controle total das OS, do orçamento à entrega. Fotos, checklist, assinatura digital.' },
  { icon: ShoppingCart, titulo: 'PDV Integrado', desc: 'Venda peças no balcão com controle de estoque automático e emissão de nota.' },
  { icon: DollarSign, titulo: 'Financeiro Completo', desc: 'Contas a pagar/receber, caixa diário, fluxo de caixa e DRE em tempo real.' },
  { icon: BarChart3, titulo: 'Relatórios Avançados', desc: 'Faturamento, ticket médio, ranking de mecânicos, CMV e muito mais.' },
  { icon: Package, titulo: 'Estoque Inteligente', desc: 'Alertas de estoque mínimo, inventário, etiquetas QR Code e movimentações.' },
  { icon: CalendarDays, titulo: 'Agendamentos', desc: 'Agenda visual para seus clientes com integração direta às ordens de serviço.' },
];

const DIFERENCIAIS = [
  { icon: Zap, texto: 'Setup em 2 minutos' },
  { icon: Shield, texto: 'Dados seguros na nuvem' },
  { icon: Clock, texto: 'Suporte via WhatsApp' },
  { icon: Users, texto: 'Multi-usuário com permissões' },
  { icon: FileText, texto: 'Emissão de NF simplificada' },
  { icon: Monitor, texto: 'Versão desktop disponível' },
];

const DEPOIMENTOS = [
  { nome: 'Carlos M.', oficina: 'CM Motos', texto: 'Antes eu perdia horas com planilhas. Agora tudo está num lugar só e meus clientes recebem o orçamento na hora.' },
  { nome: 'Roberto S.', oficina: 'RS Mecânica', texto: 'O controle financeiro mudou meu negócio. Sei exatamente quanto lucro em cada serviço.' },
  { nome: 'Fernanda L.', oficina: 'FL Auto Center', texto: 'A equipe adorou. Cada mecânico vê suas OS e comissões. Reduzi reclamações em 80%.' },
];

const FAQ = [
  { q: 'Posso testar antes de pagar?', a: 'Sim! Você tem 30 dias grátis com acesso completo. Sem cartão de crédito.' },
  { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim! Faça upgrade ou downgrade quando quiser. A mudança é imediata.' },
  { q: 'O que acontece quando meu plano vence?', a: 'Você tem 15 dias de tolerância. Após esse período, o acesso fica em modo somente leitura.' },
  { q: 'Posso cancelar minha assinatura?', a: 'Sim. Entre em contato via WhatsApp. Seus dados ficam armazenados por 90 dias.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Sim! Planos anuais têm desconto de até 20%.' },
  { q: 'Como funciona o suporte?', a: 'Todos os planos têm suporte via WhatsApp. Planos Premium têm resposta prioritária em até 2 horas.' },
];

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PLANO_INFO: Record<string, { label: string; destaque?: boolean; features: string[] }> = {
  basico: {
    label: 'Básico',
    features: ['Até 2 funcionários', 'OS ilimitadas', 'PDV integrado', 'Financeiro básico', 'Suporte WhatsApp'],
  },
  profissional: {
    label: 'Profissional',
    destaque: true,
    features: ['Até 5 funcionários', 'Tudo do Básico', 'Relatórios avançados', 'CMV e DRE', 'Agendamentos', 'Emissão de NF'],
  },
  premium: {
    label: 'Premium',
    features: ['Funcionários ilimitados', 'Tudo do Profissional', 'Suporte prioritário', 'API e integrações', 'Multi-filial'],
  },
};

function PlanosSection({ precos }: { precos: PlanoPreco[] }) {
  const [intervalo, setIntervalo] = useState<'mensal' | 'anual'>('mensal');

  const filtrados = precos.filter((p) => p.intervalo === intervalo && PLANO_INFO[p.slug]);

  return (
    <section id="planos" className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-2">
          Planos e Preços
        </h2>
        <p className="text-center text-muted-foreground mb-8">Escolha o plano ideal para sua oficina</p>

        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setIntervalo('mensal')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                intervalo === 'mensal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIntervalo('anual')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                intervalo === 'anual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual <span className="text-xs opacity-75">(-20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filtrados.map((p) => {
            const info = PLANO_INFO[p.slug];
            if (!info) return null;
            return (
              <Card
                key={p.id}
                className={`relative overflow-hidden transition-shadow ${
                  info.destaque ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
                }`}
              >
                {info.destaque && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-bold text-center py-1.5">
                    MAIS POPULAR
                  </div>
                )}
                <CardContent className={`p-6 ${info.destaque ? 'pt-10' : ''}`}>
                  <h3 className="font-bold text-lg text-foreground mb-1">{info.label}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-foreground">{formatarPreco(p.valor_centavos)}</span>
                    <span className="text-muted-foreground text-sm">/{intervalo === 'mensal' ? 'mês' : 'ano'}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {info.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/criar-conta?plano=${p.slug}&intervalo=${intervalo}`}>
                    <Button className="w-full" variant={info.destaque ? 'default' : 'outline'}>
                      Começar agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 bg-card">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-foreground mb-10">Perguntas Frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left border border-border rounded-xl p-4 transition-colors hover:bg-accent/10"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{f.q}</span>
                {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function VendasPage() {
  const { data: precos, isLoading } = usePlanoPrecos();
  const { value: downloadUrl } = useAppSetting('download_desktop_url', '#');

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="font-extrabold text-lg text-foreground">Facilita</span>
            <span className="font-extrabold text-lg text-primary">Motors</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
              Planos
            </a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/criar-conta">
              <Button size="sm">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 md:py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" /> 30 dias grátis • Sem cartão de crédito
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Sua oficina na palma da mão
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo para oficinas mecânicas. Ordens de serviço, estoque, financeiro e muito mais — tudo integrado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/criar-conta">
              <Button size="lg" className="text-base px-8 h-12">
                Começar grátis <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="#planos">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Ver planos
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Diferenciais strip */}
      <section className="border-y border-border bg-muted/50 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-3">
          {DIFERENCIAIS.map((d) => (
            <div key={d.texto} className="flex items-center gap-2 text-sm text-muted-foreground">
              <d.icon className="h-4 w-4 text-primary" />
              {d.texto}
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4">
            Tudo que sua oficina precisa
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Gerencie sua oficina com eficiência e profissionalismo
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFICIOS.map((b) => (
              <Card key={b.titulo} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{b.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      {!isLoading && precos && precos.length > 0 && <PlanosSection precos={precos} />}

      {/* Depoimentos */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-foreground mb-10">
            O que nossos clientes dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d) => (
              <Card key={d.nome} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{d.texto}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.oficina}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CTA Final */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Pronto para organizar sua oficina?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Comece agora mesmo. 30 dias grátis, sem compromisso.
          </p>
          <Link to="/criar-conta">
            <Button size="lg" variant="secondary" className="text-base px-8 h-12 font-bold">
              Criar conta grátis <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/70 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-0.5">
            <span className="font-extrabold text-lg text-background">Facilita</span>
            <span className="font-extrabold text-lg text-primary">Motors</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/login" className="hover:text-background transition-colors">Login</Link>
            <Link to="/criar-conta" className="hover:text-background transition-colors">Criar conta</Link>
            {downloadUrl !== '#' && (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-background transition-colors">
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </a>
            )}
          </div>
          <p className="text-xs text-background/50">© {new Date().getFullYear()} FacilitaMotors. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
