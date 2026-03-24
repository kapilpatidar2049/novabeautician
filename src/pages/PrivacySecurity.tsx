import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Smartphone } from 'lucide-react';

const items = [
  {
    title: 'Account Security',
    desc: 'Use strong password and do not share OTP with anyone.',
    icon: Lock,
  },
  {
    title: 'Device Security',
    desc: 'Keep app updated and lock your device with PIN/biometric.',
    icon: Smartphone,
  },
  {
    title: 'Data Privacy',
    desc: 'Customer phone/address is visible only for service delivery.',
    icon: Shield,
  },
];

export default function PrivacySecurity() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Privacy & Security</h1>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="bg-card rounded-xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
