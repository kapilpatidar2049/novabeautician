import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format, startOfDay, startOfMonth, startOfYear, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Earnings() {
  const navigate = useNavigate();
  const { appointments } = useApp();
  const [filter, setFilter] = useState<'day' | 'month' | 'year'>('day');

  const completed = appointments.filter((a) => a.status === 'completed');

  const getFilteredEarnings = () => {
    const now = new Date();
    if (filter === 'day') {
      return completed.filter(a => isSameDay(new Date(a.scheduledTime), now));
    } else if (filter === 'month') {
      return completed.filter(a => isSameMonth(new Date(a.scheduledTime), now));
    } else {
      return completed.filter(a => isSameYear(new Date(a.scheduledTime), now));
    }
  };

  const filtered = getFilteredEarnings();
  const total = filtered.reduce((sum, a) => sum + a.totalAmount, 0);

  // Grouping for history
  const history = completed.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Earnings Report</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex bg-secondary/50 p-1 rounded-xl">
          <button
            onClick={() => setFilter('day')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              filter === 'day' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('month')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              filter === 'month' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter('year')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              filter === 'year' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            This Year
          </button>
        </div>

        {/* Big Earnings Card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-card p-6 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full gradient-primary"></div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {filter === 'day' ? "Today's Revenue" : filter === 'month' ? "Monthly Revenue" : "Yearly Revenue"}
          </p>
          <div className="text-4xl font-black text-foreground">₹{total.toLocaleString()}</div>
          <div className="flex items-center justify-center gap-1.5 text-success text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>{filtered.length} Orders Completed</span>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-foreground text-lg">Transaction History</h2>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/appointment/${item.id}`)}
                  className="w-full bg-card rounded-xl border border-border/60 p-4 shadow-sm flex items-center justify-between hover:bg-secondary/20 transition-colors text-left"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground line-clamp-1">{item.services[0]?.name || 'Service'}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(item.scheduledTime), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                       <p className="font-bold text-foreground">₹{item.totalAmount.toLocaleString()}</p>
                       <p className="text-[10px] text-success font-medium">Completed</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p>No earnings history found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
