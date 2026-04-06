import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { X, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const rafRef = useRef<number>(0);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        if (mounted) setError('Não foi possível acessar a câmera.');
      }
    }

    start();
    return () => { mounted = false; stopStream(); };
  }, [stopStream]);

  useEffect(() => {
    if (!scanning) return;

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        setScanning(false);
        stopStream();
        onScan(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scanning, onScan, stopStream]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-lg overflow-hidden">
        {error ? (
          <p className="absolute inset-0 flex items-center justify-center text-destructive text-sm p-4 text-center">
            {error}
          </p>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                  <ScanLine className="absolute inset-x-0 mx-auto top-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-sm text-muted-foreground">
        {scanning ? 'Aponte a câmera para o QR Code...' : 'QR Code lido!'}
      </p>
      <Button variant="outline" onClick={() => { stopStream(); onClose(); }} className="gap-2">
        <X className="h-4 w-4" /> Fechar
      </Button>
    </div>
  );
}
