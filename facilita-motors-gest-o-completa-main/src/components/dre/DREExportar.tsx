import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function DREExportar() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 min-h-[44px]">
      <Printer className="h-4 w-4" /> Exportar
    </Button>
  );
}
