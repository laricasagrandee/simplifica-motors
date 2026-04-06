import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { AlertTriangle } from 'lucide-react';
import { useCategoriasPecas } from '@/hooks/useCategoriasPecas';
import type { Peca } from '@/types/database';

interface Props {
  pecas: Peca[];
  onEditar: (p: Peca) => void;
  onVer: (id: string) => void;
}

export function PecaListDesktop({ pecas, onEditar, onVer }: Props) {
  const { getLabel } = useCategoriasPecas();
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left px-4 py-3 font-semibold">Código</th>
            <th className="text-left px-4 py-3 font-semibold">Nome</th>
            <th className="text-left px-4 py-3 font-semibold">Marca</th>
            <th className="text-left px-4 py-3 font-semibold">Categoria</th>
            <th className="text-center px-4 py-3 font-semibold">Estoque</th>
            <th className="text-right px-4 py-3 font-semibold">Preço Venda</th>
            <th className="text-right px-4 py-3 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pecas.map((p) => {
            const emAlerta = p.estoque_atual <= p.estoque_minimo;
            return (
              <tr key={p.id} onClick={() => onVer(p.id)} className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.codigo || '—'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{p.nome}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.marca || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="bg-accent-light text-accent text-xs">{getLabel(p.categoria)}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono text-sm ${emAlerta ? 'text-danger font-bold' : 'text-foreground'}`}>
                    {emAlerta && <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {p.estoque_atual}
                  </span>
                </td>
                <td className="px-4 py-3 text-right"><MoneyDisplay valor={p.preco_venda} className="text-sm" /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={(e) => { e.stopPropagation(); onEditar(p); }} className="text-xs text-primary hover:underline">Editar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
