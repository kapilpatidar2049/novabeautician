import { ArrowLeft, Shield, Lock, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

import { useNavigate } from 'react-router-dom';

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const { changePassword } = useApp();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (res.ok) {
      toast.success("Password updated successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.error || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Privacy & Security</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-2 text-primary mb-4 font-semibold">
            <Lock className="w-5 h-5" />
            <span>Change Password</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <Input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="w-full h-11 gradient-primary mt-2"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">Security Tips</h2>
          {items.map((item) => (
            <div key={item.title} className="bg-card rounded-xl border border-border shadow-card p-4 opacity-75">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
