import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, titulo, descricao, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <h3 className="font-display font-semibold text-foreground mb-1">{titulo}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{descricao}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">{actionLabel}</Button>
      )}
      {children}
    </div>
  );
}
