import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Props {
  problema: string | null;
  diagnostico: string | null;
  onSalvarDiagnostico: (d: string) => Promise<void>;
  loading: boolean;
}

export function OSProblemaCard({ problema, diagnostico, onSalvarDiagnostico, loading }: Props) {
  const [diag, setDiag] = useState(diagnostico ?? '');

  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problema Relatado</Label>
        <div className="bg-surface-secondary rounded-lg p-3 text-sm text-foreground">{problema ? problema : <span className="text-muted-foreground italic">Nenhum problema relatado</span>}</div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diagnóstico</Label>
        <Textarea value={diag} onChange={(e) => setDiag(e.target.value)} maxLength={2000} placeholder="Registre o diagnóstico técnico..."
          className="focus:border-accent min-h-[100px]" />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => onSalvarDiagnostico(diag)} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
