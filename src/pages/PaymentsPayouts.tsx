import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Wallet, CalendarClock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { beauticianApi } from '@/lib/api';

export default function PaymentsPayouts() {
  const navigate = useNavigate();
  const { appointments } = useApp();
  const [beauticianCommissionPercent, setBeauticianCommissionPercent] = useState(10);

  useEffect(() => {
    beauticianApi
      .getMyCommission()
      .then((res) => {
        if (res.success && res.data != null) {
          setBeauticianCommissionPercent(res.data.beauticianCommissionPercent);
        }
      })
      .catch(() => {
        /* keep default */
      });
  }, []);

  const completed = appointments.filter((a) => a.status === 'completed');
  const grossEarnings = completed.reduce((sum, a) => sum + a.totalAmount, 0);
  const rate = beauticianCommissionPercent / 100;
  const platformFee = Math.round(grossEarnings * rate);
  const estimatedPayout = grossEarnings - platformFee;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Payments & Payouts</h1>
      </div>

      <div className="space-y-3">
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <IndianRupee className="w-4 h-4" />
            Total Completed Earnings
          </div>
          <p className="text-2xl font-bold">₹{grossEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Wallet className="w-4 h-4" />
            Estimated Payout
          </div>
          <p className="text-2xl font-bold text-success">₹{estimatedPayout.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Platform fee ({beauticianCommissionPercent}%): ₹{platformFee.toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CalendarClock className="w-4 h-4" />
            Settlement Schedule
          </div>
          <p className="text-sm text-muted-foreground">Payouts are processed weekly to your saved bank account.</p>
        </div>
      </div>
    </div>
  );
}
