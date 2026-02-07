import { cn } from '@/lib/utils';
import { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-info/15 text-info border-info/30',
  },
  in_transit: {
    label: 'On the way',
    className: 'bg-info/15 text-info border-info/30',
  },
  reached: {
    label: 'Reached',
    className: 'bg-accent/15 text-accent border-accent/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/15 text-success border-success/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
