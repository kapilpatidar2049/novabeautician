import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useApp } from '@/context/AppContext';
import { getFCMToken, onFCMMessage } from '@/lib/firebase';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithOtp, sendOtp, isLoggedIn } = useApp();
  const [mode, setMode] = useState<'phone' | 'email'>('phone');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // When on OTP step, fill OTP from push notification if app is in foreground
  useEffect(() => {
    if (!otpSent) return;
    const unsubscribe = onFCMMessage((payload) => {
      if (payload.data?.type === 'otp' && payload.data?.otp) {
        setOtp(payload.data.otp);
      }
    });
    return unsubscribe;
  }, [otpSent]);

  if (isLoggedIn) {
    navigate('/dashboard');
    return null;
  }

  const handleSendOtp = async () => {
    const trimmed = phone.replace(/\D/g, '').trim();
    if (trimmed.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    const fcmToken = await getFCMToken();
    const result = await sendOtp(trimmed.length === 10 ? trimmed : phone, fcmToken);
    setLoading(false);
    if (result.ok) {
      setOtpSent(true);
      setOtp('');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    const phoneToUse = phone.replace(/\D/g, '').trim();
    const result = await loginWithOtp(phoneToUse.length === 10 ? phoneToUse : phone, otp);
    setLoading(false);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleBackToPhone = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-button mb-6 animate-scale-in">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">GlamGo Partner</h1>
        <p className="text-muted-foreground text-center mb-6">
          {mode === 'phone' ? 'Sign in with your mobile number' : 'Sign in with email'}
        </p>

        <Tabs value={mode} onValueChange={(v) => { setMode(v as 'phone' | 'email'); setError(''); setOtpSent(false); setOtp(''); }} className="w-full max-w-xs">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone" className="space-y-4 mt-0">
            {!otpSent ? (
              <>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10 h-12 text-base"
                    maxLength={10}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  onClick={handleSendOtp}
                  disabled={loading || phone.replace(/\D/g, '').length < 10}
                  className="w-full h-12 gradient-primary text-primary-foreground shadow-button"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  OTP sent to {phone || 'your number'}. Enter it below.
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(v) => setOtp(v)}
                  >
                    <InputOTPGroup className="gap-1">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-12 w-10 text-base" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 gradient-primary text-primary-foreground shadow-button"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToPhone}
                  disabled={loading}
                >
                  Change number
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-0">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground shadow-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </TabsContent>
        </Tabs>

        <button
          type="button"
          className="mt-4 text-xs text-primary underline"
          onClick={() => navigate('/register')}
        >
          New beautician? Register here
        </button>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our <span className="text-primary">Terms of Service</span> and{' '}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
