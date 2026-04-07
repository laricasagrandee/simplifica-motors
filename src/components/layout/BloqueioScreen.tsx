import { ShieldAlert } from 'lucide-react';
import { SUPORTE_WHATSAPP, SUPORTE_NOME } from '@/lib/constants';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

function formatarTelefone(num: string) {
  const clean = num.replace(/\D/g, '');
  if (clean.length === 13) {
    return `(${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  return num;
}

export function BloqueioScreen() {
  const { data: config } = useConfiguracoes();
  const nomeOficina = config?.nome_fantasia || '';

  const mensagem = encodeURIComponent(
    `Olá! Preciso regularizar meu acesso ao ${SUPORTE_NOME}.${nomeOficina ? ` Oficina: ${nomeOficina}` : ''}`
  );
  const whatsappLink = `https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagem}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-baseline gap-0.5 mb-6">
        <span className="font-display font-extrabold text-3xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-3xl text-primary">Motors</span>
      </div>
      <div className="rounded-full p-6 mb-6 bg-destructive/10">
        <ShieldAlert className="h-12 w-12 text-destructive" strokeWidth={1.5} />
      </div>
      <h1 className="font-display font-bold text-2xl mb-2">Acesso suspenso</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Seu acesso foi suspenso por pendência financeira. Entre em contato para regularizar e voltar a usar o sistema.
      </p>
      <div className="bg-muted rounded-lg p-4 max-w-sm mb-6">
        <p className="text-sm font-medium mb-1">WhatsApp de Suporte</p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-accent font-mono font-bold text-lg">
          {formatarTelefone(SUPORTE_WHATSAPP)}
        </a>
      </div>
    </div>
  );
}
