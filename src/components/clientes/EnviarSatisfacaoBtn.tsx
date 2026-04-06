import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

interface Props {
  clienteNome: string;
  clienteTelefone: string;
}

export function EnviarSatisfacaoBtn({ clienteNome, clienteTelefone }: Props) {
  const { data: config } = useConfiguracoes();
  const nomeOficina = config?.nome_fantasia ?? 'nossa oficina';

  const msg = encodeURIComponent(
    `Olá ${clienteNome}! Como foi sua experiência na ${nomeOficina}? Avalie de 1 a 5 estrelas respondendo esta mensagem. Sua opinião é muito importante! ⭐`
  );
  const fone = clienteTelefone.replace(/\D/g, '');
  const url = `https://wa.me/55${fone}?text=${msg}`;

  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" /> Enviar Pesquisa
      </a>
    </Button>
  );
}
