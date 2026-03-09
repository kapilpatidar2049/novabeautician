import { useEffect, useRef } from 'react';
import { beauticianApi } from '@/lib/api';

const LOCATION_UPDATE_INTERVAL_MS = 12_000;

export function useLocationSharing(appointmentId: string | undefined, enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!appointmentId || !enabled) return;

    const sendLocation = (lat: number, lng: number) => {
      beauticianApi.updateLocation({ appointmentId, lat, lng }).catch(() => {});
    };

    const tick = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocation(latitude, longitude);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
      );
    };

    tick();
    intervalRef.current = setInterval(tick, LOCATION_UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [appointmentId, enabled]);
}
