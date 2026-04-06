import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Car, ClipboardList, Package, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  tipo: 'cliente' | 'veiculo' | 'os' | 'peca';
  id: string;
  titulo: string;
  subtitulo?: string;
  link: string;
}

const ICONS = { cliente: User, veiculo: Car, os: ClipboardList, peca: Package };
const LABELS = { cliente: 'Clientes', veiculo: 'Veículos', os: 'Ordens de Serviço', peca: 'Peças' };

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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
    const isNumeric = /^\d+$/.test(q);

    const [clientes, veiculos, os, osByNum, pecas] = await Promise.all([
      supabase.from('clientes').select('id, nome, telefone').or(`nome.ilike.${ql},telefone.ilike.${ql}`).limit(3),
      supabase.from('motos').select('id, marca, modelo, placa, cliente_id').or(`placa.ilike.${ql},modelo.ilike.${ql},marca.ilike.${ql}`).limit(3),
      supabase.from('ordens_servico').select('id, numero').or(`numero::text.ilike.${ql}`).limit(3),
      isNumeric ? supabase.from('ordens_servico').select('id, numero').eq('numero', parseInt(q)).limit(3) : Promise.resolve({ data: [] }),
      supabase.from('pecas').select('id, nome, codigo').or(`nome.ilike.${ql},codigo.ilike.${ql}`).limit(3),
    ]);

    (clientes.data ?? []).forEach(c => items.push({ tipo: 'cliente', id: c.id, titulo: c.nome, subtitulo: c.telefone || undefined, link: `/clientes/${c.id}` }));
    (veiculos.data ?? []).forEach(v => items.push({ tipo: 'veiculo', id: v.id, titulo: [v.marca, v.modelo].filter(Boolean).join(' ') || 'Veículo', subtitulo: v.placa || undefined, link: `/clientes/${v.cliente_id}` }));
    const osMap = new Map<string, { id: string; numero: number }>();
    (os.data ?? []).forEach(o => osMap.set(o.id, o));
    (osByNum.data ?? []).forEach(o => osMap.set(o.id, o));
    Array.from(osMap.values()).forEach(o => items.push({ tipo: 'os', id: o.id, titulo: `OS-${String(o.numero).padStart(4, '0')}`, link: `/os/${o.id}` }));
    (pecas.data ?? []).forEach(p => items.push({ tipo: 'peca', id: p.id, titulo: p.nome, subtitulo: p.codigo || undefined, link: '/pecas' }));

    setResults(items);
    setLoading(false);
  };

  const handleSelect = (r: SearchResult) => {
    navigate(r.link);
    onClose();
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.tipo]) acc[r.tipo] = [];
    acc[r.tipo].push(r);
    return acc;
  }, {});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <div className="flex items-center gap-2 px-3 h-14 border-b border-border bg-card">
        <button onClick={onClose} className="p-2 -ml-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, placa, OS, peça..."
            className="pl-10 pr-8 h-10 bg-muted/50 border-transparent text-sm" />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground text-center">Buscando...</p>
        ) : query.trim().length >= 2 && Object.keys(grouped).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">
            Nenhum resultado pra "<span className="font-medium text-foreground">{query.trim()}</span>"
          </p>
        ) : (
          Object.entries(grouped).map(([tipo, items]) => {
            const Icon = ICONS[tipo as keyof typeof ICONS];
            return (
              <div key={tipo}>
                <p className="px-4 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30 sticky top-0">
                  {LABELS[tipo as keyof typeof LABELS]}
                </p>
                {items.map((r) => (
                  <button key={r.id} onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors border-b border-border/50">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
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
    </div>
  );
}
