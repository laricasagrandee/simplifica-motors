import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Plano { nome: string; preco: number; periodo: string; features: { texto: string; incluso: boolean }[]; recomendado?: boolean; }
interface Props { planoAtual: string; onAssinar: (plano: string) => void; }

const planosMensal: Plano[] = [
  { nome: 'basico', preco: 89, periodo: '/mês', features: [
    { texto: 'Até 3 funcionários', incluso: true }, { texto: 'OS e PDV', incluso: true },
    { texto: 'Financeiro básico', incluso: true }, { texto: 'Relatórios', incluso: false },
    { texto: 'NF automática', incluso: false }, { texto: 'Suporte prioritário', incluso: false },
  ]},
  { nome: 'profissional', preco: 149, periodo: '/mês', recomendado: true, features: [
    { texto: 'Até 10 funcionários', incluso: true }, { texto: 'OS e PDV', incluso: true },
    { texto: 'Financeiro completo', incluso: true }, { texto: 'Relatórios', incluso: true },
    { texto: 'NF automática', incluso: true }, { texto: 'Suporte prioritário', incluso: false },
  ]},
  { nome: 'premium', preco: 249, periodo: '/mês', features: [
    { texto: 'Funcionários ilimitados', incluso: true }, { texto: 'OS e PDV', incluso: true },
    { texto: 'Financeiro completo', incluso: true }, { texto: 'Relatórios', incluso: true },
    { texto: 'NF automática', incluso: true }, { texto: 'Suporte prioritário', incluso: true },
  ]},
];

export function PlanosComparativo({ planoAtual, onAssinar }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {planosMensal.map(p => (
        <Card key={p.nome} className={p.recomendado ? 'border-accent shadow-md ring-2 ring-accent/20' : ''}>
          <CardHeader className="text-center pb-2">
            {p.recomendado && <Badge className="bg-accent text-accent-foreground mx-auto mb-2">Recomendado</Badge>}
            <CardTitle className="capitalize text-lg">{p.nome}</CardTitle>
            <p className="font-mono text-3xl font-bold text-accent">R$ {p.preco}<span className="text-sm text-muted-foreground font-normal">{p.periodo}</span></p>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {f.incluso ? <Check className="h-4 w-4 text-success flex-shrink-0" /> : <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                <span className={f.incluso ? '' : 'text-muted-foreground'}>{f.texto}</span>
              </div>
            ))}
            <Button onClick={() => onAssinar(p.nome)} className="w-full min-h-[44px] mt-4" variant={planoAtual === p.nome ? 'outline' : 'default'}
              disabled={planoAtual === p.nome}>
              {planoAtual === p.nome ? 'Plano Atual' : 'Assinar'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
