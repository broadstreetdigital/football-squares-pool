/**
 * Pool Status Badge Component
 */

import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: 'open' | 'locked' | 'numbered' | 'completed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap = {
    open: { label: 'Open', className: 'status-open' },
    locked: { label: 'Locked', className: 'status-locked' },
    numbered: { label: 'Numbered', className: 'status-numbered' },
    completed: { label: 'Completed', className: 'status-completed' },
  };

  const { label, className: statusClass } = statusMap[status];

  return (
    <span className={cn('status-badge', statusClass, className)}>
      {label}
    </span>
  );
}
