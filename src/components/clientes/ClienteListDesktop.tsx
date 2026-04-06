import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Cliente } from '@/types/database';

interface Props {
  clientes: (Cliente & { motos_count: number })[];
  onEditar: (c: Cliente) => void;
  onVer: (id: string) => void;
  onExcluir: (c: Cliente) => void;
}

function formatDoc(doc: string | null | undefined) {
  if (!doc) return '—';
  const d = doc.replace(/\D/g, '');
  if (!d) return '—';
  return d.length > 11 ? formatarCNPJ(d) : formatarCPF(d);
}

export function ClienteListDesktop({ clientes, onEditar, onVer, onExcluir }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left px-4 py-3 font-semibold">Nome</th>
            <th className="text-left px-4 py-3 font-semibold">CPF/CNPJ</th>
            <th className="text-left px-4 py-3 font-semibold">Telefone</th>
            <th className="text-left px-4 py-3 font-semibold">Cidade</th>
            <th className="text-right px-4 py-3 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr
              key={c.id}
              onClick={() => onVer(c.id)}
              className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-foreground">{c.nome}</td>
              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{formatDoc(c.cpf_cnpj)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {c.telefone ? formatarTelefone(c.telefone) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {c.endereco_cidade ? [c.endereco_cidade, c.endereco_estado].filter(Boolean).join(' - ') : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEditar(c); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onExcluir(c); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
