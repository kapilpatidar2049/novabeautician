import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Gift, Loader2, Share2 } from 'lucide-react';
import { beauticianApi } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

export default function Referral() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [customerReward, setCustomerReward] = useState(0);
  const [beauticianReward, setBeauticianReward] = useState(0);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await beauticianApi.getReferral();
        if (cancelled) return;
        if (res.success && res.data) {
          setCode(res.data.referralCode);
          setEnabled(res.data.isEnabled);
          setCustomerReward(res.data.customerRewardAmount);
          setBeauticianReward(res.data.beauticianRewardAmount);
          setShareMessage(res.data.shareMessage);
        }
      } catch {
        toast.error('Could not load referral info');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, navigate]);

  const buildShareText = () => {
    const base =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}#/register?ref=${code || ''}`
        : '';
    return `${shareMessage}\n\nMy code: ${code || ''}\n${base}`;
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const doShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nova Beauty referral', text });
      } catch {
        /* dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Message copied');
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-foreground/15">
            <Gift className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Refer & earn</h1>
            <p className="text-sm text-primary-foreground/80">Share your code with new customers</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {!enabled && (
              <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
                Referral rewards are paused by admin. You can still share your code.
              </div>
            )}
            {enabled && (
              <div className="bg-card rounded-xl border border-border p-4 text-sm space-y-2 shadow-card">
                <p className="text-muted-foreground">
                  When a new user signs up with your code and completes their <strong>first booking</strong>, you can
                  earn up to ₹{beauticianReward} (beautician referrer reward). They may get up to ₹{customerReward} as a
                  new customer.
                </p>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-xs text-muted-foreground mb-2">Your referral code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-2xl font-bold tracking-widest text-foreground break-all">{code || '—'}</code>
                <button
                  type="button"
                  onClick={copyCode}
                  disabled={!code}
                  className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Copy code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={doShare}
              disabled={!code}
              className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold disabled:opacity-50 shadow-card"
            >
              <Share2 className="w-5 h-5" />
              Share invite
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
