import { ShieldAlert, FlaskConical } from 'lucide-react';
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
  const isTeste = config?.plano === 'teste';

  const mensagem = encodeURIComponent(
    isTeste
      ? `Olá! Meu período de teste do ${SUPORTE_NOME} acabou e gostaria de ativar um plano.${nomeOficina ? ` Oficina: ${nomeOficina}` : ''}`
      : `Olá! Preciso renovar meu plano do ${SUPORTE_NOME}.${nomeOficina ? ` Oficina: ${nomeOficina}` : ''}`
  );
  const whatsappLink = `https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagem}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-baseline gap-0.5 mb-6">
        <span className="font-display font-extrabold text-3xl text-foreground">Facilita</span>
        <span className="font-display font-extrabold text-3xl text-primary">Motors</span>
      </div>
      <div className={`rounded-full p-6 mb-6 ${isTeste ? 'bg-blue-500/10' : 'bg-danger-light'}`}>
        {isTeste ? (
          <FlaskConical className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
        ) : (
          <ShieldAlert className="h-12 w-12 text-danger" strokeWidth={1.5} />
        )}
      </div>
      <h1 className="font-display font-bold text-2xl mb-2">
        {isTeste ? 'Seu período de teste acabou!' : 'Sua assinatura expirou'}
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        {isTeste
          ? 'Seu teste grátis de 30 dias terminou. Contate o suporte para ativar seu plano e continuar usando o sistema.'
          : 'Entre em contato para renovar seu plano e voltar a ter acesso completo ao sistema.'}
      </p>
      <div className="bg-muted rounded-lg p-4 max-w-sm mb-6">
        <p className="text-sm font-medium mb-1">WhatsApp de Suporte</p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-accent font-mono font-bold text-lg">
          {formatarTelefone(SUPORTE_WHATSAPP)}
        </a>
      </div>
      <div className="bg-surface-secondary rounded-lg p-4 max-w-sm text-left">
        <p className="text-sm font-semibold mb-2">O que você ainda pode fazer:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>✓ Visualizar clientes, OS e financeiro</li>
          <li>✗ Criar ou editar qualquer registro</li>
          <li>✗ Abrir novas OS ou vendas</li>
        </ul>
      </div>
    </div>
  );
}
