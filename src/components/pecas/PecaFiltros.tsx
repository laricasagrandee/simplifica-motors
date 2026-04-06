import { SearchInput } from '@/components/shared/SearchInput';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCategoriasPecas } from '@/hooks/useCategoriasPecas';

interface Props {
  busca: string;
  categoria: string;
  apenasAlerta: boolean;
  onBuscaChange: (v: string) => void;
  onCategoriaChange: (v: string) => void;
  onAlertaChange: (v: boolean) => void;
}

export function PecaFiltros({ busca, categoria, apenasAlerta, onBuscaChange, onCategoriaChange, onAlertaChange }: Props) {
  const { options } = useCategoriasPecas();
  const categoriaOptions = [{ value: 'all', label: 'Todas' }, ...options];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <SearchInput placeholder="Buscar por nome ou código..." onSearch={onBuscaChange} className="flex-1" />
      <SearchableSelect
        value={categoria}
        onValueChange={onCategoriaChange}
        options={categoriaOptions}
        placeholder="Categoria"
        triggerClassName="w-full sm:w-[180px]"
      />
      <div className="flex items-center gap-2 shrink-0">
        <Switch id="alerta" checked={apenasAlerta} onCheckedChange={onAlertaChange} />
        <Label htmlFor="alerta" className="text-sm text-muted-foreground whitespace-nowrap">Só alertas</Label>
      </div>
    </div>
  );
}
