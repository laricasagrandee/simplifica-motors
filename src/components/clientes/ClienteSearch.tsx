import { SearchInput } from '@/components/shared/SearchInput';

interface ClienteSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ClienteSearch({ value, onChange }: ClienteSearchProps) {
  return (
    <SearchInput
      placeholder="Buscar por nome, telefone ou placa..."
      onSearch={onChange}
      className="max-w-sm"
    />
  );
}
