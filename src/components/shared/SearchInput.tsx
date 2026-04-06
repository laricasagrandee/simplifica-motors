import { Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
}

export function SearchInput({ placeholder = 'Buscar...', onSearch, className = '' }: SearchInputProps) {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => onSearch(val), 300);
      };
    })(),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <button onClick={() => setValue('')} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}
