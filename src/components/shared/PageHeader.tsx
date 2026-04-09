import { ReactNode } from 'react';

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground truncate">{titulo}</h1>
        {subtitulo && <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}
