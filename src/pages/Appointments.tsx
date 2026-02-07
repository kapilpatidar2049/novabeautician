import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function Appointments() {
  const navigate = useNavigate();
  const { appointments } = useApp();

  const upcomingAppointments = appointments.filter(
    apt => apt.status !== 'completed' && apt.status !== 'cancelled'
  );

  const completedAppointments = appointments.filter(
    apt => apt.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">My Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed ({completedAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-0">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt, index) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => navigate(`/appointment/${apt.id}`)}
                  isNext={index === 0}
                />
              ))
            ) : (
              <div className="bg-card rounded-xl p-8 text-center shadow-card">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No upcoming jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Stay online to receive new bookings
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedAppointments.length > 0 ? (
              completedAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => navigate(`/appointment/${apt.id}`)}
                />
              ))
            ) : (
              <div className="bg-card rounded-xl p-8 text-center shadow-card">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No completed jobs yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your completed services will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
