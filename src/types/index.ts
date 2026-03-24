export type JobStatus = 'pending' | 'accepted' | 'rejected' | 'in_transit' | 'reached' | 'in_progress' | 'completed' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  landmark?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface ProductUsage {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface AppointmentRatingSnippet {
  stars: number;
  comment?: string;
}

export interface Appointment {
  id: string;
  customer: Customer;
  services: Service[];
  scheduledTime: Date;
  status: JobStatus;
  totalAmount: number;
  notes?: string;
  productsUsed?: ProductUsage[];
  startedAt?: Date;
  completedAt?: Date;
  ratingFromCustomer?: AppointmentRatingSnippet | null;
  ratingFromBeautician?: AppointmentRatingSnippet | null;
  /** True when service is completed but this user (beautician) has not rated the customer yet */
  needsBeauticianRating?: boolean;
}

export interface BeauticianProfile {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  /** Full URL from API after profile photo upload */
  profileImageUrl?: string | null;
  city: string;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
}

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayouts: number;
}

export interface Notification {
  id: string;
  type: 'new_job' | 'delay_alert' | 'payment' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
