import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TrendingUp, Calendar, IndianRupee, Star, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { OnlineToggle } from '@/components/OnlineToggle';
import { AppointmentCard } from '@/components/AppointmentCard';
import { mockEarnings } from '@/data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { beautician, appointments, isLocationSharing, activeAppointment } = useApp();

  const todayAppointments = appointments.filter(
    apt => apt.status !== 'completed' && apt.status !== 'cancelled'
  );

  const completedToday = appointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">Good Morning</p>
            <h1 className="text-xl font-bold text-primary-foreground">
              {beautician.name}
            </h1>
          </div>
          <OnlineToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/95 backdrop-blur rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Today's Jobs</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
            <p className="text-xs text-success mt-1">
              {completedToday} completed
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs">Today's Earnings</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{mockEarnings.today.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-success">+12%</span> vs yesterday
            </p>
          </div>
        </div>
      </div>

      {/* City & Rating */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{beautician.city}</p>
              <p className="text-xs text-muted-foreground">Working Area</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-warning/15 text-warning px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-sm">{beautician.rating}</span>
          </div>
        </div>
      </div>

      {/* Location Sharing Banner */}
      {isLocationSharing && activeAppointment && (
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate(`/appointment/${activeAppointment.id}`)}
            className="w-full bg-info/15 border border-info/30 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center">
              <MapPin className="w-5 h-5 text-info-foreground animate-pulse-soft" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-info">Sharing Location</p>
              <p className="text-xs text-muted-foreground">
                {activeAppointment.customer.name} • Tap to view
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Today's Appointments */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Today's Schedule</h2>
          <span className="text-sm text-muted-foreground">
            {format(new Date(), 'EEE, MMM d')}
          </span>
        </div>

        <div className="space-y-3">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((apt, index) => (
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
              <h3 className="font-medium text-foreground mb-1">No jobs scheduled</h3>
              <p className="text-sm text-muted-foreground">
                Stay online to receive new bookings
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
