import { format } from 'date-fns';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Appointment } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  isNext?: boolean;
}

export function AppointmentCard({ appointment, onClick, isNext }: AppointmentCardProps) {
  const totalDuration = appointment.services.reduce((acc, s) => acc + s.duration, 0);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-card rounded-xl p-4 shadow-card border border-border transition-all hover:shadow-elevated hover:border-primary/20 active:scale-[0.98]',
        isNext && 'ring-2 ring-primary/20 border-primary/30'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isNext && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Next
              </span>
            )}
            <StatusBadge status={appointment.status} />
          </div>
          <h3 className="font-semibold text-foreground mt-2">
            {appointment.customer.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            ₹{appointment.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>
            {format(appointment.scheduledTime, 'h:mm a')} · {totalDuration} mins
          </span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span className="text-left line-clamp-3 leading-tight">{appointment.customer.address}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {appointment.services.slice(0, 2).map(service => (
              <span
                key={service.id}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              >
                {service.name}
              </span>
            ))}
            {appointment.services.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{appointment.services.length - 2} more
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}
