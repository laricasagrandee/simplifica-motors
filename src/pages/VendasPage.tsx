import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ShoppingCart, DollarSign, BarChart3, Package, CalendarDays,
  CheckCircle, Star, ChevronDown, ChevronUp, ArrowRight, Users, Shield, Zap,
  Clock, FileText, Monitor, Smartphone, Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanoPrecos } from '@/hooks/useStripe';
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
  { icon: Users, texto: 'Funcionários ilimitados' },
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
  { q: 'Quantos funcionários posso cadastrar?', a: 'Ilimitados! Não há limite de funcionários em nenhum plano.' },
  { q: 'O que acontece quando meu plano vence?', a: 'Você tem 15 dias de tolerância. Após esse período, o acesso fica em modo somente leitura.' },
  { q: 'Posso cancelar minha assinatura?', a: 'Sim. Entre em contato via WhatsApp. Seus dados ficam armazenados por 90 dias.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Sim! O plano anual sai por R$ 209,90 — economia de mais de R$ 28 por ano.' },
  { q: 'Em quais dispositivos funciona?', a: 'Web (navegador), aplicativo desktop (Windows/Mac) e celular (PWA).' },
  { q: 'Como funciona o suporte?', a: 'Suporte via WhatsApp com resposta rápida para todos os assinantes.' },
];

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const FEATURES_COMPLETO = [
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

function PlanosSection() {
  const { data: precos } = usePlanoPrecos();
  const [intervalo, setIntervalo] = useState<'mensal' | 'anual'>('mensal');

  const preco = precos?.find((p) => p.slug === 'completo' && p.intervalo === intervalo);
  const precoMensal = precos?.find((p) => p.slug === 'completo' && p.intervalo === 'mensal');
  const precoAnual = precos?.find((p) => p.slug === 'completo' && p.intervalo === 'anual');

  if (!preco) return null;

  const economiaAnual = precoMensal && precoAnual
    ? (precoMensal.valor_centavos * 12) - precoAnual.valor_centavos
    : 0;

  return (
    <section id="planos" className="py-20 px-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-2">
          Plano Único, Tudo Incluso
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Sem surpresas. Um preço justo com acesso completo.
        </p>

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
              Anual {economiaAnual > 0 && <span className="text-xs opacity-75">(economize {formatarPreco(economiaAnual)})</span>}
            </button>
          </div>
        </div>

        <Card className="ring-2 ring-primary shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="font-bold text-xl text-foreground mb-1">Plano Completo</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Laptop className="h-5 w-5 text-muted-foreground" />
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Web • Desktop • Mobile</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-extrabold text-foreground">{formatarPreco(preco.valor_centavos)}</span>
              <span className="text-muted-foreground text-sm">/{intervalo === 'mensal' ? 'mês' : 'ano'}</span>
              {intervalo === 'anual' && precoMensal && (
                <p className="text-xs text-primary mt-1">
                  equivale a {formatarPreco(Math.round(preco.valor_centavos / 12))}/mês
                </p>
              )}
            </div>

            <ul className="space-y-2.5 mb-8">
              {FEATURES_COMPLETO.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link to={`/criar-conta?plano=completo&intervalo=${intervalo}`}>
              <Button className="w-full" size="lg">
                Começar 30 dias grátis <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Sem cartão de crédito. Cancele quando quiser.
            </p>
          </CardContent>
        </Card>
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
              Preços
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
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Sistema completo para oficinas mecânicas. Ordens de serviço, estoque, financeiro e muito mais — tudo integrado.
          </p>
          <p className="text-2xl font-bold text-primary mb-8">
            A partir de R$ 19,90/mês
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/criar-conta">
              <Button size="lg" className="text-base px-8 h-12">
                Começar grátis <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="#planos">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Ver preço
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
      <PlanosSection />

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
