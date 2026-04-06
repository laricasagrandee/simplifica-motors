import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFuncionarios } from '@/hooks/useFuncionarios';

interface Props {
  mecanicoId: string | null;
  onMudar: (id: string) => void;
}

export function OSMecanicoSelect({ mecanicoId, onMudar }: Props) {
  const { data: mecanicos } = useFuncionarios('mecanico');

  const options = (mecanicos ?? []).map((m) => ({
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
    <div className="space-y-1.5 mb-6">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mecânico Responsável</Label>
      <SearchableSelect value={mecanicoId ?? ''} onValueChange={onMudar} options={options} placeholder="Selecione" triggerClassName="max-w-xs" />
    </div>
  );
}
