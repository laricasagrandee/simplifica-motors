import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <h1 className="font-display font-bold text-4xl text-foreground mb-2">404</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        A página que você procura não existe ou foi movida.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
    </div>
  );
}
