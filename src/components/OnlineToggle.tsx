import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function OnlineToggle() {
  const { beautician, toggleOnlineStatus, isLocationSharing } = useApp();

  return (
    <button
      onClick={toggleOnlineStatus}
      disabled={isLocationSharing}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all',
        beautician.isOnline
          ? 'bg-success/15 text-success border border-success/30'
          : 'bg-muted text-muted-foreground border border-border',
        isLocationSharing && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          beautician.isOnline ? 'bg-success animate-pulse-soft' : 'bg-muted-foreground'
        )}
      />
      {beautician.isOnline ? 'Online' : 'Offline'}
    </button>
  );
}
