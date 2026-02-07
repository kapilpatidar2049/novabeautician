import { Appointment, BeauticianProfile, EarningsSummary, Notification } from '@/types';

export const mockBeautician: BeauticianProfile = {
  id: 'b1',
  name: 'Priya Sharma',
  phone: '+91 98765 43210',
  avatar: undefined,
  city: 'Mumbai',
  isOnline: true,
  rating: 4.8,
  totalJobs: 234,
};

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    customer: {
      id: 'c1',
      name: 'Anjali Mehta',
      phone: '+91 99887 76655',
      address: '302, Rose Garden Apartments, Andheri West',
      city: 'Mumbai',
      landmark: 'Near D-Mart',
      coordinates: { lat: 19.1364, lng: 72.8296 },
    },
    services: [
      { id: 's1', name: 'Bridal Makeup', duration: 90, price: 5000 },
      { id: 's2', name: 'Hair Styling', duration: 45, price: 1500 },
    ],
    scheduledTime: new Date(Date.now() + 30 * 60000), // 30 mins from now
    status: 'pending',
    totalAmount: 6500,
    notes: 'Please bring extra foundation shades',
  },
  {
    id: 'apt2',
    customer: {
      id: 'c2',
      name: 'Sneha Patel',
      phone: '+91 88776 65544',
      address: '15, Sunrise Villa, Bandra East',
      city: 'Mumbai',
      coordinates: { lat: 19.0596, lng: 72.8411 },
    },
    services: [
      { id: 's3', name: 'Facial Treatment', duration: 60, price: 2000 },
      { id: 's4', name: 'Manicure & Pedicure', duration: 75, price: 1800 },
    ],
    scheduledTime: new Date(Date.now() + 3 * 60 * 60000), // 3 hours from now
    status: 'pending',
    totalAmount: 3800,
  },
  {
    id: 'apt3',
    customer: {
      id: 'c3',
      name: 'Kavita Desai',
      phone: '+91 77665 54433',
      address: '8/A, Ocean View, Juhu',
      city: 'Mumbai',
      landmark: 'Opposite Juhu Beach',
      coordinates: { lat: 19.0883, lng: 72.8264 },
    },
    services: [
      { id: 's5', name: 'Party Makeup', duration: 60, price: 3000 },
    ],
    scheduledTime: new Date(Date.now() + 5 * 60 * 60000), // 5 hours from now
    status: 'pending',
    totalAmount: 3000,
  },
];

export const mockEarnings: EarningsSummary = {
  today: 6500,
  thisWeek: 32500,
  thisMonth: 125000,
  pendingPayouts: 45000,
};

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'new_job',
    title: 'New Booking!',
    message: 'Bridal Makeup booking for tomorrow at 10 AM',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Payment Received',
    message: '₹3,500 credited to your account',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    read: false,
  },
  {
    id: 'n3',
    type: 'delay_alert',
    title: 'Running Late?',
    message: 'Your next appointment starts in 15 minutes',
    timestamp: new Date(Date.now() - 15 * 60000),
    read: true,
  },
];

export const availableProducts = [
  { id: 'p1', name: 'Foundation', unit: 'ml' },
  { id: 'p2', name: 'Lipstick', unit: 'pcs' },
  { id: 'p3', name: 'Eye Shadow Palette', unit: 'pcs' },
  { id: 'p4', name: 'Nail Polish', unit: 'ml' },
  { id: 'p5', name: 'Hair Serum', unit: 'ml' },
  { id: 'p6', name: 'Face Wash', unit: 'ml' },
  { id: 'p7', name: 'Moisturizer', unit: 'ml' },
  { id: 'p8', name: 'Setting Spray', unit: 'ml' },
];
