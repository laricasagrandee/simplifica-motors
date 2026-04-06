import { STATUS_OS_CONFIG } from '@/lib/constants';
import type { StatusOS } from '@/types/database';

interface StatusBadgeProps {
  status: StatusOS;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_OS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}
