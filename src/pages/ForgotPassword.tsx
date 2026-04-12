import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendOtp, resetPassword } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.ok) {
      setStep('otp');
      toast.success('OTP sent to your phone');
    } else {
      toast.error(res.error || 'Failed to send OTP');
    }
  };

  const handleReset = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await resetPassword({ phone, otp, newPassword });
    setLoading(false);
    if (res.ok) {
      setStep('success');
    } else {
      toast.error(res.error || 'Failed to reset password');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
        <p className="text-muted-foreground mb-8">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Button onClick={() => navigate('/login')} className="w-full h-12 gradient-primary">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Forgot Password</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {step === 'phone' ? (
          <>
            <div>
              <p className="text-muted-foreground mb-6">
                Enter your registered mobile number and we'll send you an OTP to reset your password.
              </p>
              <div className="relative mb-4">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="pl-10 h-12"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
              <Button onClick={handleSendOtp} disabled={loading || phone.length < 10} className="w-full h-12 gradient-primary">
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              OTP sent to {phone}. Enter it below along with your new password.
            </p>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-1">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-10" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New Password"
                className="pl-10 h-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <Button onClick={handleReset} disabled={loading || otp.length < 6 || newPassword.length < 6} className="w-full h-12 gradient-primary">
              {loading ? 'Updating...' : 'Set New Password'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
