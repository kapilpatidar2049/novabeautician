import { format } from 'date-fns';
import { Bell, CreditCard, AlertTriangle, Briefcase, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<Notification['type'], React.ElementType> = {
  new_job: Briefcase,
  payment: CreditCard,
  delay_alert: AlertTriangle,
  general: Bell,
};

const colorMap: Record<Notification['type'], string> = {
  new_job: 'bg-primary/15 text-primary',
  payment: 'bg-success/15 text-success',
  delay_alert: 'bg-warning/15 text-warning',
  general: 'bg-info/15 text-info',
};

export default function Notifications() {
  const { notifications, markNotificationRead } = useApp();

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notification => {
            const Icon = iconMap[notification.type];
            const colorClass = colorMap[notification.type];

            return (
              <button
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                className={cn(
                  'w-full text-left bg-card rounded-xl p-4 shadow-card border transition-all',
                  notification.read
                    ? 'border-border opacity-70'
                    : 'border-primary/20 ring-1 ring-primary/10'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      colorClass
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(notification.timestamp, 'h:mm a')}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="bg-card rounded-xl p-8 text-center shadow-card">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
