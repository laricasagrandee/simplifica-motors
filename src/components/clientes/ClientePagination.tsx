import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientePaginationProps {
  pagina: number;
  total: number;
  porPagina: number;
  onChange: (p: number) => void;
}

export function ClientePagination({ pagina, total, porPagina, onChange }: ClientePaginationProps) {
  const totalPages = Math.ceil(total / porPagina);
  if (totalPages <= 1) return null;

  const from = (pagina - 1) * porPagina + 1;
  const to = Math.min(pagina * porPagina, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-muted-foreground">
        {from}–{to} de {total} clientes
      </span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" disabled={pagina >= totalPages} onClick={() => onChange(pagina + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
