import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { LoadingState } from '@/components/shared/LoadingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X, ZoomIn, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { OSFoto } from '@/types/database';

export type FotoCategoria = 'entrada' | 'durante' | 'saida' | 'recusa';

interface Props {
  fotos: OSFoto[];
  loading: boolean;
  onUpload: (file: File, categoria: FotoCategoria, descricao?: string) => Promise<void>;
  onRemover: (id: string, url: string) => Promise<void>;
  uploading: boolean;
  categoriaInicial?: FotoCategoria;
}

const CATS = [
  { value: 'entrada' as const, label: 'Entrada' },
  { value: 'durante' as const, label: 'Durante' },
  { value: 'saida' as const, label: 'Saída' },
  { value: 'recusa' as const, label: 'Recusa / Devolução' },
];

export function OSFotosTab({ fotos, loading, onUpload, onRemover, uploading, categoriaInicial = 'entrada' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cat, setCat] = useState<FotoCategoria>(categoriaInicial);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [descricaoFoto, setDescricaoFoto] = useState('');

  if (loading) return <LoadingState variant="card" />;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    await onUpload(file, cat, descricaoFoto || undefined);
    setDescricaoFoto('');
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {CATS.map(({ value, label }) => {
        const catFotos = fotos.filter((f) => (f.categoria || f.tipo) === value);
        return (
          <div key={value}>
            <h4 className="text-sm font-semibold text-foreground mb-2">{label} ({catFotos.length} fotos)</h4>
            <div className="grid grid-cols-3 gap-2">
              {catFotos.map((f) => (
                <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={f.url} alt={f.descricao || ''} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setLightbox(f.url)} className="p-1.5 bg-white/80 rounded-lg"><ZoomIn className="h-4 w-4" /></button>
                    <button onClick={() => onRemover(f.id, f.url)} className="p-1.5 bg-danger text-white rounded-lg"><X className="h-4 w-4" /></button>
                  </div>
                  {f.descricao && <p className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1.5 py-0.5 truncate">{f.descricao}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {cat === 'recusa' && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning text-sm">Registre o estado do veículo antes da devolução</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SearchableSelect value={cat} onValueChange={(v) => setCat(v as FotoCategoria)} options={CATS} placeholder="Categoria" triggerClassName="w-40" />
          <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading || fotos.length >= 20} className="gap-1">
            <Camera className="h-4 w-4" /> Adicionar Foto
          </Button>
        </div>
        <Input placeholder="Descreva a foto..." value={descricaoFoto} onChange={(e) => setDescricaoFoto(e.target.value)} className="min-h-[44px]" />
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} className="hidden" />

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black border-none">
          {lightbox && <img src={lightbox} alt="" className="w-full h-auto max-h-[80vh] object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
