import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, PhoneCall, Mail, MessageCircle } from 'lucide-react';

export default function HelpSupport() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="space-y-3">
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Headphones className="w-4 h-4 text-primary" />
            <p className="font-medium">Partner Support</p>
          </div>
          <p className="text-sm text-muted-foreground">For onboarding, jobs, and payout issues contact support team.</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-4 h-4 text-primary" />
            <p className="font-medium">Phone</p>
          </div>
          <p className="text-sm text-muted-foreground">+91-90000-00000</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-primary" />
            <p className="font-medium">Email</p>
          </div>
          <p className="text-sm text-muted-foreground">support@novabeauty.in</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-primary" />
            <p className="font-medium">Response Time</p>
          </div>
          <p className="text-sm text-muted-foreground">Typically within 2-4 business hours.</p>
        </div>
      </div>
    </div>
  );
}
