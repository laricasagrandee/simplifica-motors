import { SearchInput } from '@/components/shared/SearchInput';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { STATUS_OS_CONFIG } from '@/lib/constants';
import type { OSFiltros } from '@/hooks/useOS';

interface Props {
  filtros: OSFiltros;
  onFiltrosChange: (f: Partial<OSFiltros>) => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  ...Object.entries(STATUS_OS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
];

export function OSFiltros({ filtros, onFiltrosChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <SearchInput
        placeholder="Buscar nº OS, cliente ou placa..."
        onSearch={(v) => onFiltrosChange({ busca: v, pagina: 1 })}
        className="flex-1"
      />
      <SearchableSelect
        value={filtros.status || 'all'}
        onValueChange={(v) => onFiltrosChange({ status: v === 'all' ? '' : v as OSFiltros['status'], pagina: 1 })}
        options={statusOptions}
        placeholder="Status"
        triggerClassName="w-full sm:w-[180px]"
      />
    </div>
  );
}
