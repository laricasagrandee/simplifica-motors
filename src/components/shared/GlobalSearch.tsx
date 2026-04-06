import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Car, ClipboardList, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  tipo: 'cliente' | 'veiculo' | 'os' | 'peca';
  id: string;
  titulo: string;
  subtitulo?: string;
  link: string;
}

const ICONS = {
  cliente: User,
  veiculo: Car,
  os: ClipboardList,
  peca: Package,
};

const LABELS = {
  cliente: 'Clientes',
  veiculo: 'Veículos',
  os: 'Ordens de Serviço',
  peca: 'Peças',
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.trim().length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(() => doSearch(query.trim()), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const doSearch = async (q: string) => {
    setLoading(true);
    const items: SearchResult[] = [];
    const ql = `%${q}%`;

    const [clientes, veiculos, os, pecas] = await Promise.all([
      supabase.from('clientes').select('id, nome, telefone').or(`nome.ilike.${ql},telefone.ilike.${ql}`).limit(3),
      supabase.from('motos').select('id, marca, modelo, placa, cliente_id').or(`placa.ilike.${ql},modelo.ilike.${ql},marca.ilike.${ql}`).limit(3),
      supabase.from('ordens_servico').select('id, numero').or(`numero::text.ilike.${ql}`).limit(3),
      supabase.from('pecas').select('id, nome, codigo').or(`nome.ilike.${ql},codigo.ilike.${ql}`).limit(3),
    ]);

    (clientes.data ?? []).forEach(c => items.push({
      tipo: 'cliente', id: c.id, titulo: c.nome, subtitulo: c.telefone || undefined, link: `/clientes/${c.id}`,
    }));
    (veiculos.data ?? []).forEach(v => items.push({
      tipo: 'veiculo', id: v.id, titulo: [v.marca, v.modelo].filter(Boolean).join(' ') || 'Veículo',
      subtitulo: v.placa || undefined, link: `/clientes/${v.cliente_id}`,
    }));
    (os.data ?? []).forEach(o => items.push({
      tipo: 'os', id: o.id, titulo: `OS-${String(o.numero).padStart(4, '0')}`, link: `/os/${o.id}`,
    }));
    (pecas.data ?? []).forEach(p => items.push({
      tipo: 'peca', id: p.id, titulo: p.nome, subtitulo: p.codigo || undefined, link: '/pecas',
    }));

    setResults(items);
    setLoading(false);
    setOpen(items.length > 0);
  };

  const handleSelect = (r: SearchResult) => {
    navigate(r.link);
    setQuery('');
    setOpen(false);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.tipo]) acc[r.tipo] = [];
    acc[r.tipo].push(r);
    return acc;
  }, {});

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim().length >= 2) setOpen(true); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar cliente, placa, OS, peça..."
          className="pl-10 pr-8 h-9 w-full sm:w-72 bg-muted/50 border-transparent focus:border-border text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-3 text-sm text-muted-foreground text-center">Buscando...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground text-center">Nenhum resultado</p>
          ) : (
            Object.entries(grouped).map(([tipo, items]) => {
              const Icon = ICONS[tipo as keyof typeof ICONS];
              return (
                <div key={tipo}>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30">
                    {LABELS[tipo as keyof typeof LABELS]}
                  </p>
                  {items.map((r) => (
                    <button key={r.id} onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 text-left transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.titulo}</p>
                        {r.subtitulo && <p className="text-xs text-muted-foreground">{r.subtitulo}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
