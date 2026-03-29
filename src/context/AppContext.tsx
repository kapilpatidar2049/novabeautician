import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { Appointment, BeauticianProfile, Notification, JobStatus } from '@/types';
import { beauticianApi, authApi, setAuthTokens, clearAuth, setUser, getUser, type ApiAppointment, type ApiKycStatus, type ApiKycDocument } from '@/lib/api';
import { getFCMToken, isFirebaseConfigured, onFCMMessage } from '@/lib/firebase';
import alertSound from '@/alert.mp3';

/** Show city name from populated API object; never show raw ObjectId string. */
function cityDisplayName(city: unknown): string {
  if (city == null) return '';
  if (typeof city === 'object' && city !== null && 'name' in city) {
    const n = (city as { name?: string }).name;
    return typeof n === 'string' ? n.trim() : '';
  }
  if (typeof city === 'string') {
    const s = city.trim();
    if (/^[a-fA-F0-9]{24}$/.test(s)) return '';
    return s;
  }
  return '';
}

function mapApiAppointmentToAppointment(item: ApiAppointment): Appointment {
  const [lng, lat] = item.location?.coordinates ?? [72.83, 19.06];
  const needsBeauticianRating =
    item.status === 'completed' &&
    !(item.ratingFromBeautician && item.ratingFromBeautician.stars != null);
  return {
    id: item._id,
    customer: {
      id: item.customer._id,
      name: item.customer.name,
      phone: item.customer.phone || '',
      address: item.address,
      city: '',
      coordinates: { lat, lng },
    },
    services: [
      {
        id: item.service._id,
        name: item.service.name,
        duration: item.service.durationMinutes,
        price: item.service.basePrice,
      },
    ],
    scheduledTime: new Date(item.scheduledAt),
    status: item.status as JobStatus,
    totalAmount: item.price,
    notes: item.notes,
    ratingFromCustomer: item.ratingFromCustomer,
    ratingFromBeautician: item.ratingFromBeautician,
    needsBeauticianRating,
  };
}

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
  updateAppointmentStatus: (appointmentId: string, status: JobStatus) => Promise<boolean>;
  toggleOnlineStatus: () => void;
  markNotificationRead: (notificationId: string) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOtp: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  sendOtp: (phone: string, fcmToken?: string | null) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  appointmentsLoading: boolean;
  refreshAppointments: () => Promise<void>;
  kyc: ApiKycStatus | null;
  refreshKyc: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultBeauticianProfile = (savedUser: { name: string; phone?: string } | null): BeauticianProfile => ({
  id: '',
  name: savedUser?.name ?? '',
  phone: savedUser?.phone ?? '',
  city: localStorage.getItem('beautician_city_hint') || '',
  isOnline: true,
  rating: 0,
  totalJobs: 0,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const savedUser = getUser();
  const [beautician, setBeautician] = useState<BeauticianProfile>(defaultBeauticianProfile(savedUser));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedUser);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [kyc, setKyc] = useState<ApiKycStatus | null>(null);

  const refreshAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const res = await beauticianApi.getAppointments(1, 100);
      if (res.success && res.data?.items) {
        const items = res.data.items.map(mapApiAppointmentToAppointment);
        setAppointments(items);
        setBeautician((b) => ({ ...b, totalJobs: items.filter((a) => a.status === 'completed').length }));
      }
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        const cityValue = cityDisplayName(res.data.city);
        setBeautician((b) => ({
          ...b,
          name: res.data?.name || b.name,
          phone: res.data?.phone || b.phone,
          city: cityValue || b.city || '',
          profileImageUrl: res.data.profileImageUrl ?? null,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshKyc = useCallback(async () => {
    try {
      const res = await beauticianApi.getKyc();
      if (res.success && res.data) {
        setKyc(res.data as ApiKycStatus);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshProfile();
      refreshAppointments();
      refreshKyc();
    }
  }, [isLoggedIn, refreshAppointments, refreshKyc, refreshProfile]);

  useEffect(() => {
    if (!isLoggedIn || !isFirebaseConfigured()) return;
    getFCMToken().then((token) => {
      if (token) authApi.registerFcmToken(token).catch(() => {});
    });
  }, [isLoggedIn]);

  // Play alert tone and refresh list when a new appointment notification arrives via FCM while app is open
  useEffect(() => {
    if (!isLoggedIn || !isFirebaseConfigured()) return;
    const unsubscribe = onFCMMessage((payload) => {
      const type = payload.data?.type;
      const notificationType = type === 'appointment_created'
        ? 'new_job'
        : type?.includes('payment')
          ? 'payment'
          : type?.includes('delay')
            ? 'delay_alert'
            : 'general';
      setNotifications((prev) => ([
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: notificationType,
          title: payload.notification?.title || 'Update',
          message: payload.notification?.body || 'You have a new update.',
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]));
      if (type === 'appointment_created') {
        const audio = new Audio(alertSound);
        audio.play().catch(() => {});
        // Fetch latest jobs so newly assigned bookings appear immediately
        refreshAppointments();
      }
    });
    return unsubscribe;
  }, [isLoggedIn, refreshAppointments]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data?.user && res.data?.tokens) {
        const { user, tokens } = res.data;
        if (user.role !== 'beautician') {
          return { ok: false, error: 'Invalid account type. Use the beautician app.' };
        }
        setAuthTokens(tokens.accessToken, tokens.refreshToken);
        setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
        setBeautician((b) => ({ ...b, name: user.name, phone: user.phone || b.phone }));
        setIsLoggedIn(true);
        await refreshProfile();
        await refreshKyc();
        return { ok: true };
      }
      return { ok: false, error: (res as { message?: string }).message || 'Login failed' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Login failed' };
    }
  };

  const sendOtp = async (phone: string, fcmToken?: string | null) => {
    try {
      const res = await authApi.sendOtp(phone, fcmToken);
      if (res.success) return { ok: true };
      return { ok: false, error: (res as { message?: string }).message || 'Failed to send OTP' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Failed to send OTP' };
    }
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    try {
      const res = await authApi.verifyOtp(phone, otp);
      if (res.success && res.data?.user && res.data?.tokens) {
        const { user, tokens } = res.data;
        if (user.role !== 'beautician') {
          return { ok: false, error: 'Invalid account type. Use the beautician app.' };
        }
        setAuthTokens(tokens.accessToken, tokens.refreshToken);
        setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
        setBeautician((b) => ({ ...b, name: user.name, phone: user.phone || b.phone }));
        setIsLoggedIn(true);
        await refreshProfile();
        await refreshKyc();
        return { ok: true };
      }
      return { ok: false, error: (res as { message?: string }).message || 'Verification failed' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Verification failed' };
    }
  };

  const updateProfile = async (payload: { name?: string; phone?: string }) => {
    try {
      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        setBeautician((prev) => ({
          ...prev,
          name: res.data?.name || prev.name,
          phone: res.data?.phone || prev.phone,
        }));
        const existing = getUser();
        if (existing) {
          setUser({
            ...existing,
            name: res.data?.name || existing.name,
            phone: res.data?.phone || existing.phone,
          });
        }
        return { ok: true };
      }
      return { ok: false, error: (res as { message?: string }).message || 'Unable to update profile' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unable to update profile' };
    }
  };

  const logout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setAppointments([]);
    setActiveAppointment(null);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: JobStatus): Promise<boolean> => {
    try {
      if (status === 'accepted') {
        await beauticianApi.acceptAppointment(appointmentId);
      } else if (status === 'rejected') {
        await beauticianApi.rejectAppointment(appointmentId);
      } else if (status === 'reached' || status === 'in_progress') {
        await beauticianApi.startAppointment(appointmentId);
      } else if (status === 'completed') {
        await beauticianApi.completeAppointment(appointmentId);
      }
      await refreshAppointments();
      if (status === 'accepted' || status === 'reached' || status === 'in_progress') {
        setIsLocationSharing(true);
      } else if (status === 'completed' || status === 'cancelled') {
        setIsLocationSharing(false);
        setActiveAppointment(null);
      }
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
      return false;
    }
  };

  const toggleOnlineStatus = async () => {
    const next = !beautician.isOnline;
    try {
      await beauticianApi.setAvailability(next);
      setBeautician((prev) => ({ ...prev, isOnline: next }));
    } catch {
      // ignore API errors, keep previous state
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
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
        isLoggedIn,
        login,
        loginWithOtp,
        sendOtp,
        logout,
        appointmentsLoading,
        refreshAppointments,
        kyc,
        refreshKyc,
        refreshProfile,
        updateProfile,
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
