import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFuncionarios } from '@/hooks/useFuncionarios';

interface DadosProblema {
  problemaRelatado: string;
  funcionarioId: string;
  observacoes: string;
}

interface Props {
  dados: DadosProblema;
  onChange: (d: Partial<DadosProblema>) => void;
  onVoltar: () => void;
  onProximo: () => void;
}

export function NovaOSProblema({ dados, onChange, onVoltar, onProximo }: Props) {
  const { data: mecanicos } = useFuncionarios('mecanico');

  const mecanicoOptions = (mecanicos ?? []).map((m) => ({
    value: m.id,
    label: m.nome,
    renderLabel: (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          {m.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        {m.nome}
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">Problema Relatado</h3>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problema relatado pelo cliente</Label>
        <Textarea
          value={dados.problemaRelatado}
          onChange={(e) => onChange({ problemaRelatado: e.target.value })}
          placeholder="Descreva o que o cliente relatou..."
          maxLength={2000}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mecânico Responsável</Label>
        <SearchableSelect value={dados.funcionarioId} onValueChange={(v) => onChange({ funcionarioId: v })} options={mecanicoOptions} placeholder="Selecione (opcional)" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observações</Label>
        <Textarea
          value={dados.observacoes}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          placeholder="Informações adicionais (opcional)"
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onVoltar}>← Voltar</Button>
        <Button onClick={onProximo}>Próximo →</Button>
      </div>
    </div>
  );
}
