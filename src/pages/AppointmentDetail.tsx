import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Phone, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { ServiceExecutionFlow } from '@/components/ServiceExecutionFlow';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments, setActiveAppointment, isLocationSharing } = useApp();

  const appointment = appointments.find(apt => apt.id === id);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-semibold text-foreground">Appointment not found</h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Set as active appointment when viewing
  if (appointment.status !== 'pending' && appointment.status !== 'completed') {
    setActiveAppointment(appointment);
  }

  const totalDuration = appointment.services.reduce((acc, s) => acc + s.duration, 0);

  const showLocationSharing = 
    appointment.status === 'accepted' || 
    appointment.status === 'in_transit' || 
    appointment.status === 'reached' ||
    appointment.status === 'in_progress';

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Appointment Details</h1>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Card */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {appointment.customer.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {appointment.customer.address}
              </p>
              {appointment.customer.landmark && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {appointment.customer.landmark}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">
                ₹{appointment.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{format(appointment.scheduledTime, 'h:mm a')}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {totalDuration} mins total
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`tel:${appointment.customer.phone}`)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`sms:${appointment.customer.phone}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {/* Map */}
        <MapPlaceholder
          customer={appointment.customer}
          isLocationSharing={showLocationSharing}
          eta={showLocationSharing ? '12 mins' : undefined}
        />

        {/* Services */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">Services</h3>
          <div className="space-y-3">
            {appointment.services.map(service => (
              <div
                key={service.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration} mins</p>
                </div>
                <p className="font-semibold text-foreground">
                  ₹{service.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">
              ₹{appointment.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <h4 className="font-medium text-warning mb-1 text-sm">Special Notes</h4>
            <p className="text-sm text-foreground">{appointment.notes}</p>
          </div>
        )}

        {/* Service Execution Flow */}
        <ServiceExecutionFlow appointment={appointment} />
      </div>
    </div>
  );
}
