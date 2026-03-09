import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LogOut,
  MapPin,
  Star,
  Briefcase,
  IndianRupee,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { OnlineToggle } from '@/components/OnlineToggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Profile() {
  const navigate = useNavigate();
  const { beautician, appointments, logout } = useApp();

  const now = new Date();
  const thisMonthEarnings = appointments
    .filter((a) => a.status === 'completed' && new Date(a.scheduledTime).getMonth() === now.getMonth() && new Date(a.scheduledTime).getFullYear() === now.getFullYear())
    .reduce((sum, a) => sum + a.totalAmount, 0);

  const menuItems = [
    { icon: IndianRupee, label: 'Earnings', value: `₹${thisMonthEarnings.toLocaleString()}` },
    { icon: FileText, label: 'Documents', chevron: true },
    { icon: Shield, label: 'Privacy & Security', chevron: true },
    { icon: HelpCircle, label: 'Help & Support', chevron: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Card */}
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-primary-foreground/30">
            <AvatarFallback className="bg-primary-foreground text-primary text-xl font-bold">
              {beautician.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">
              {beautician.name}
            </h1>
            <p className="text-primary-foreground/80 text-sm">{beautician.phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card/95 backdrop-blur rounded-xl p-3 text-center shadow-card">
            <div className="flex items-center justify-center gap-1 text-warning mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{beautician.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card/95 backdrop-blur rounded-xl p-3 text-center shadow-card">
            <p className="font-bold text-foreground">{beautician.totalJobs}</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </div>
          <div className="bg-card/95 backdrop-blur rounded-xl p-3 text-center shadow-card">
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{beautician.city}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Availability</h3>
              <p className="text-sm text-muted-foreground">
                {beautician.isOnline ? 'Accepting new jobs' : 'Not accepting jobs'}
              </p>
            </div>
            <OnlineToggle />
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                {item.value ? (
                  <span className="font-semibold text-foreground">{item.value}</span>
                ) : (
                  item.chevron && <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
