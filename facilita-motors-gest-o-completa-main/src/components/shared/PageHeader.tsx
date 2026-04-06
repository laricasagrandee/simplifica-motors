import { ReactNode } from 'react';

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{titulo}</h1>
        {subtitulo && <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-3 sm:mt-0">{children}</div>}
    </div>
  );
}
