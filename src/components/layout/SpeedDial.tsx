import { useNavigate } from 'react-router-dom';
import { X, ClipboardList, ShoppingCart, UserPlus, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

const actions = [
  { label: 'Nova OS', icon: ClipboardList, path: '/os/nova', color: 'bg-primary text-primary-foreground' },
  { label: 'Venda Rápida', icon: ShoppingCart, path: '/pdv', color: 'bg-accent text-accent-foreground' },
  { label: 'Novo Cliente', icon: UserPlus, path: '/clientes', color: 'bg-info text-info-foreground' },
  { label: 'Nova Movimentação', icon: Wallet, path: '/financeiro', color: 'bg-success text-success-foreground' },
];

export function SpeedDial({ open, onClose }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] lg:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 animate-fade-in" />

      <div className="absolute bottom-24 right-4 flex flex-col-reverse items-end gap-3">
        {actions.map((action, idx) => (
          <button key={action.path}
            onClick={(e) => { e.stopPropagation(); navigate(action.path); onClose(); }}
            className={cn(
              'flex items-center gap-3 rounded-full pl-4 pr-5 py-3 shadow-lg font-medium text-sm',
              'animate-scale-in', action.color
            )}
            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>
            <action.icon className="h-5 w-5" strokeWidth={1.75} />
            {action.label}
          </button>
        ))}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute bottom-20 right-4 z-[56] flex items-center justify-center w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform rotate-0">
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
