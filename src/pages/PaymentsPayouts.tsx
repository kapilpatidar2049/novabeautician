import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Wallet, CalendarClock, History, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { withdrawalApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PaymentsPayouts() {
  const navigate = useNavigate();
  const { beautician, requestWithdrawal, refreshProfile } = useApp();
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mode, setMode] = useState<'withdraw' | 'add'>('withdraw');

  const handleAddMoney = () => {
    toast.info('Online recharge will be available soon. Please contact admin for manual top-up.');
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await withdrawalApi.getMyHistory();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (val > (beautician.walletBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    const res = await requestWithdrawal(val);
    setLoading(false);

    if (res.ok) {
      toast.success('Withdrawal request submitted');
      setAmount('');
      await refreshProfile();
      fetchHistory();
    } else {
      toast.error(res.error || 'Failed to submit request');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Payments & Payouts</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Wallet Card */}
        <div className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-button shadow-primary/20">
          <div className="flex items-center gap-2 opacity-90 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <div className="text-4xl font-bold">₹{(beautician.walletBalance || 0).toLocaleString()}</div>
          <p className="text-xs mt-3 opacity-80 italic">Ready to be withdrawn to your bank account.</p>
        </div>

        {/* Tabs for Add/Withdraw */}
        <div className="flex bg-secondary/50 p-1 rounded-xl">
          <button
            onClick={() => setMode('withdraw')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
              mode === 'withdraw' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            <History className="w-4 h-4" />
            Withdraw
          </button>
          <button
            onClick={() => setMode('add')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
              mode === 'add' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            <IndianRupee className="w-4 h-4" />
            Add Fund
          </button>
        </div>

        {/* Withdrawal Form */}
        {mode === 'withdraw' && (
          <div className="bg-card rounded-2xl border border-border/60 shadow-card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span>Request Withdrawal</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg">₹</span>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-14 pl-8 text-xl font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleWithdraw} 
              disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > (beautician.walletBalance || 0)}
              className="w-full h-12 shadow-button gradient-primary font-bold text-base"
            >
              {loading ? 'Processing...' : 'Withdraw Money'}
            </Button>
            
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3 text-[11px] text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <p>Requests are usually processed within 24-48 business hours.</p>
            </div>
          </div>
        )}

        {/* Add Fund Form */}
        {mode === 'add' && (
          <div className="bg-card rounded-2xl border border-border/60 shadow-card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Wallet className="w-5 h-5 text-primary" />
              <span>Recharge Wallet</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg">₹</span>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-14 pl-8 text-xl font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                 {[500, 1000, 2000].map(val => (
                   <button key={val} onClick={() => setAmount(String(val))} className="px-3 py-1.5 rounded-lg bg-secondary text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors">
                      +₹{val}
                   </button>
                 ))}
              </div>
            </div>

            <Button 
              onClick={handleAddMoney} 
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full h-12 shadow-button gradient-primary font-bold text-base"
            >
              {loading ? 'Processing...' : 'Proceed to Pay'}
            </Button>
            
            <p className="text-[10px] text-muted-foreground text-center">Secure payments powered by Razorpay</p>
          </div>
        )}

        {/* History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <History className="w-5 h-5 text-primary" />
              <span>Transaction History</span>
            </div>
          </div>

          <div className="space-y-3">
            {fetching ? (
              <div className="py-8 text-center text-muted-foreground italic">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p>No withdrawal requests yet.</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item._id} className="bg-card rounded-xl border border-border/60 p-4 shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">₹{item.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {item.adminNotes && (
                      <p className="text-[10px] text-destructive mt-1 font-medium bg-destructive/10 px-2 py-0.5 rounded inline-block">
                        Note: {item.adminNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                    {item.status === 'approved' && (
                      <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </div>
                    )}
                    {item.status === 'rejected' && (
                      <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
