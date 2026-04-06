import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Phone, MapPin } from 'lucide-react';
import type { Cliente } from '@/types/database';

interface ClienteCardProps {
  cliente: Cliente & { motos_count: number };
  onEditar: () => void;
  onExcluir?: () => void;
}

function formatDoc(doc: string | null) {
  if (!doc) return null;
  const d = doc.replace(/\D/g, '');
  return d.length > 11 ? formatarCNPJ(d) : formatarCPF(d);
}

export function ClienteCard({ cliente, onEditar, onExcluir }: ClienteCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{cliente.nome}</p>
          {cliente.cpf_cnpj && (
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {formatDoc(cliente.cpf_cnpj)}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); onEditar(); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          {onExcluir && (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={(e) => { e.stopPropagation(); onExcluir(); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {cliente.telefone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {formatarTelefone(cliente.telefone)}
          </div>
        )}
        {cliente.endereco_cidade && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {[cliente.endereco_cidade, cliente.endereco_estado].filter(Boolean).join(' - ')}
          </div>
        )}
      </div>
    </div>
  );
}
