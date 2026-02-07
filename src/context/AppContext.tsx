import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Appointment, BeauticianProfile, Notification, JobStatus } from '@/types';
import { mockAppointments, mockBeautician, mockNotifications } from '@/data/mockData';

interface AppContextType {
  beautician: BeauticianProfile;
  setBeautician: React.Dispatch<React.SetStateAction<BeauticianProfile>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  activeAppointment: Appointment | null;
  setActiveAppointment: React.Dispatch<React.SetStateAction<Appointment | null>>;
  isLocationSharing: boolean;
  setIsLocationSharing: React.Dispatch<React.SetStateAction<boolean>>;
  updateAppointmentStatus: (appointmentId: string, status: JobStatus) => void;
  toggleOnlineStatus: () => void;
  markNotificationRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [beautician, setBeautician] = useState<BeauticianProfile>(mockBeautician);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);

  const updateAppointmentStatus = (appointmentId: string, status: JobStatus) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? {
              ...apt,
              status,
              ...(status === 'in_progress' ? { startedAt: new Date() } : {}),
              ...(status === 'completed' ? { completedAt: new Date() } : {}),
            }
          : apt
      )
    );

    // Update active appointment if it matches
    if (activeAppointment?.id === appointmentId) {
      setActiveAppointment(prev =>
        prev
          ? {
              ...prev,
              status,
              ...(status === 'in_progress' ? { startedAt: new Date() } : {}),
              ...(status === 'completed' ? { completedAt: new Date() } : {}),
            }
          : null
      );
    }

    // Handle location sharing
    if (status === 'accepted' || status === 'in_transit') {
      setIsLocationSharing(true);
    } else if (status === 'completed' || status === 'cancelled') {
      setIsLocationSharing(false);
      setActiveAppointment(null);
    }
  };

  const toggleOnlineStatus = () => {
    setBeautician(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        beautician,
        setBeautician,
        appointments,
        setAppointments,
        notifications,
        setNotifications,
        activeAppointment,
        setActiveAppointment,
        isLocationSharing,
        setIsLocationSharing,
        updateAppointmentStatus,
        toggleOnlineStatus,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
