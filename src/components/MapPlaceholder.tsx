import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types';

interface MapPlaceholderProps {
  customer: Customer;
  isLocationSharing?: boolean;
  eta?: string;
}

export function MapPlaceholder({ customer, isLocationSharing, eta }: MapPlaceholderProps) {
  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${customer.coordinates.lat},${customer.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative bg-gradient-to-br from-muted to-secondary rounded-xl overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
        {/* Location Sharing Indicator */}
        {isLocationSharing && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-success/15 text-success px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse-soft" />
            Sharing Location
          </div>
        )}

        {/* ETA Badge */}
        {eta && (
          <div className="absolute top-3 right-3 bg-card shadow-card px-3 py-1.5 rounded-full text-xs font-semibold">
            ETA: {eta}
          </div>
        )}

        {/* Center Pin */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-button">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          {isLocationSharing && (
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/30 animate-ping" />
          )}
        </div>

        <h4 className="font-semibold text-foreground mb-1">{customer.name}</h4>
        <p className="text-sm text-muted-foreground mb-1">
          {customer.building && <span className="block font-medium">{customer.building}{customer.floor ? `, Fl ${customer.floor}` : ''}</span>}
          {customer.originalAddress || customer.address}
        </p>
        {customer.landmark && (
          <p className="text-xs text-primary font-medium mt-1">📍 Landmark: {customer.landmark}</p>
        )}

        <Button
          onClick={openInMaps}
          className="mt-4 gradient-primary text-primary-foreground shadow-button"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Navigate
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </div>
  );
}
