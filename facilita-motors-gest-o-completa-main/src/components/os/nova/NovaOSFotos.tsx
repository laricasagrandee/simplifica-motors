import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';

interface Props {
  fotos: File[];
  onAdicionarFoto: (file: File) => void;
  onRemoverFoto: (index: number) => void;
  onVoltar: () => void;
  onAbrir: () => void;
  loading: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_W = 1200;
      let w = img.width, h = img.height;
      if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function NovaOSFotos({ fotos, onAdicionarFoto, onRemoverFoto, onVoltar, onAbrir, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_SIZE) return;
    const compressed = await compressImage(file);
    onAdicionarFoto(compressed);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">Fotos de Entrada</h3>
      <p className="text-sm text-muted-foreground">Registre o estado do veículo na chegada.</p>

      <div className="grid grid-cols-3 gap-3">
        {fotos.map((f, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onRemoverFoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {fotos.length < 10 && (
          <button onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:bg-muted/30 transition-colors min-h-[44px]">
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Adicionar</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} className="hidden" />
      <p className="text-xs text-muted-foreground">Você pode adicionar fotos depois também.</p>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onVoltar}>← Voltar</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onAbrir} disabled={loading}>Pular</Button>
          <Button onClick={onAbrir} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Abrir OS'}
          </Button>
        </div>
      </div>
    </div>
  );
}
