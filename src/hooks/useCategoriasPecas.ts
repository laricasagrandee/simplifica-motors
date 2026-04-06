import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'facilita_categorias_pecas';

export interface CategoriaPecaItem {
  id: string;
  label: string;
}

const CATEGORIAS_PADRAO: CategoriaPecaItem[] = [
  { id: 'motor', label: 'Motor' },
  { id: 'suspensao', label: 'Suspensão' },
  { id: 'freios', label: 'Freios' },
  { id: 'eletrica', label: 'Elétrica' },
  { id: 'acessorios', label: 'Acessórios' },
  { id: 'lubrificantes', label: 'Lubrificantes' },
  { id: 'pneus', label: 'Pneus' },
  { id: 'filtros', label: 'Filtros' },
  { id: 'transmissao', label: 'Transmissão' },
  { id: 'outros', label: 'Outros' },
];

function loadCategorias(): CategoriaPecaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return CATEGORIAS_PADRAO;
}

function saveCategorias(cats: CategoriaPecaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function useCategoriasPecas() {
  const [categorias, setCategorias] = useState<CategoriaPecaItem[]>(loadCategorias);

  useEffect(() => {
    const handler = () => setCategorias(loadCategorias());
    window.addEventListener('storage', handler);
    window.addEventListener('categorias_pecas_changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('categorias_pecas_changed', handler);
    };
  }, []);

  const adicionar = useCallback((label: string) => {
    const id = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    setCategorias((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      const next = [...prev, { id, label }];
      saveCategorias(next);
      window.dispatchEvent(new Event('categorias_pecas_changed'));
      return next;
    });
    return id;
  }, []);

  const editar = useCallback((id: string, novoLabel: string) => {
    setCategorias((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, label: novoLabel } : c));
      saveCategorias(next);
      window.dispatchEvent(new Event('categorias_pecas_changed'));
      return next;
    });
  }, []);

  const excluir = useCallback((id: string) => {
    setCategorias((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCategorias(next);
      window.dispatchEvent(new Event('categorias_pecas_changed'));
      return next;
    });
  }, []);

  const restaurarPadrao = useCallback(() => {
    saveCategorias(CATEGORIAS_PADRAO);
    setCategorias(CATEGORIAS_PADRAO);
    window.dispatchEvent(new Event('categorias_pecas_changed'));
  }, []);

  const getLabel = useCallback(
    (id: string) => categorias.find((c) => c.id === id)?.label ?? id,
    [categorias]
  );

  const options = categorias.map((c) => ({ value: c.id, label: c.label }));

  return { categorias, options, adicionar, editar, excluir, restaurarPadrao, getLabel };
}
