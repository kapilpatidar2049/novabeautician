import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setCountdown(30);
      }, 1000);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1000);
    }
  };

  const handleResendOtp = () => {
    setCountdown(30);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-button mb-6 animate-scale-in">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">GlamGo Partner</h1>
        <p className="text-muted-foreground text-center mb-8">
          {step === 'phone'
            ? 'Enter your mobile number to continue'
            : `Enter the OTP sent to +91 ${phone}`}
        </p>

        {/* Form */}
        <div className="w-full max-w-xs space-y-4">
          {step === 'phone' ? (
            <>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-16 h-12 text-base"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-12 gradient-primary text-primary-foreground shadow-button"
              >
                {isLoading ? 'Sending...' : 'Get OTP'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-11 h-12 text-lg border-border rounded-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length < 6 || isLoading}
                className="w-full h-12 gradient-primary text-primary-foreground shadow-button"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in{' '}
                    <span className="font-semibold text-foreground">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Change number
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <span className="text-primary">Terms of Service</span> and{' '}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
