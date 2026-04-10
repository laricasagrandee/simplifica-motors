import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatarDataCurta } from '@/lib/formatters';
import { FileText, Eye, Printer } from 'lucide-react';

interface NF {
  id: string; numero: number | string; tipo: string; valor?: number; valor_total?: number;
  emitida_em?: string; data_emissao?: string;
  clientes?: { nome: string; telefone?: string } | null;
  destinatario_nome?: string;
}

interface Props {
  notas: NF[];
  loading: boolean;
  onVer: (id: string) => void;
  onImprimir: (id: string) => void;
}

export function NFList({ notas, loading, onVer, onImprimir }: Props) {
  if (loading) return <LoadingState />;
  if (!notas.length) return <EmptyState icon={FileText} titulo="Nenhum comprovante" descricao="Emita seu primeiro comprovante." />;

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-2">Nº</th><th className="p-2">Tipo</th><th className="p-2">Cliente</th>
            <th className="p-2 text-right">Valor</th><th className="p-2">Data</th><th className="p-2">Ações</th>
          </tr></thead>
          <tbody>{notas.map(nf => {
            const cli = nf.clientes as { nome: string } | null;
            return (
              <tr key={nf.id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-mono text-accent">{nf.numero}</td>
                <td className="p-2">
                  <Badge className={nf.tipo === 'servico' ? 'bg-info-light text-info' : 'bg-accent-light text-accent'}>
                    {nf.tipo === 'servico' ? 'Serviço' : 'Produto'}
                  </Badge>
                </td>
                <td className="p-2">{cli?.nome || nf.destinatario_nome || '-'}</td>
                <td className="p-2 text-right"><MoneyDisplay valor={nf.valor ?? nf.valor_total ?? 0} /></td>
                <td className="p-2 font-mono text-xs">{formatarDataCurta(nf.emitida_em ?? nf.data_emissao ?? '')}</td>
                <td className="p-2 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onVer(nf.id)} title="Visualizar">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onImprimir(nf.id)} title="Imprimir">
                    <Printer className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {notas.map(nf => {
          const cli = nf.clientes as { nome: string } | null;
          return (
            <div key={nf.id} className="rounded-lg border bg-card p-3 cursor-pointer" onClick={() => onVer(nf.id)}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-accent text-sm">Nº {nf.numero}</span>
                <Badge className={nf.tipo === 'servico' ? 'bg-info-light text-info' : 'bg-accent-light text-accent'} variant="outline">
                  {nf.tipo === 'servico' ? 'Serviço' : 'Produto'}
                </Badge>
              </div>
              <p className="text-sm">{cli?.nome || nf.destinatario_nome || '-'}</p>
              <div className="flex justify-between items-center mt-1">
                <MoneyDisplay valor={nf.valor ?? nf.valor_total ?? 0} />
                <span className="text-xs text-muted-foreground font-mono">
                  {formatarDataCurta(nf.emitida_em ?? nf.data_emissao ?? '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
