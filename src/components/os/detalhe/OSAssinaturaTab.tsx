import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  assinatura: string | null;
  onSalvar: (base64: string) => Promise<void>;
  loading: boolean;
}

export function OSAssinaturaTab({ assinatura, onSalvar, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const t = 'touches' in e ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stop = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const save = async () => {
    const data = canvasRef.current!.toDataURL('image/png');
    await onSalvar(data);
  };

  if (assinatura) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Assinatura do cliente</p>
        <img src={assinatura} alt="Assinatura" className="mx-auto border border-border rounded-xl max-w-sm w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Peça ao cliente para assinar abaixo:</p>
      <canvas ref={canvasRef}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        className="w-full h-48 border-2 border-dashed border-border rounded-xl cursor-crosshair touch-none bg-white"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={clear}>Limpar</Button>
        <Button onClick={save} disabled={!hasDrawn || loading}>Salvar Assinatura</Button>
      </div>
    </div>
  );
}
