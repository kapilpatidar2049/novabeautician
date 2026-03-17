import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { beauticianApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function KycStatus() {
  const navigate = useNavigate();
  const { kyc, refreshKyc } = useApp();
  const status = kyc?.kycStatus || 'pending';
  const docs = kyc?.documents || [];

  const [idUrl, setIdUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [expUrl, setExpUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitDocs = async () => {
    const payload: Array<{ type: string; url: string }> = [];
    if (idUrl.trim()) payload.push({ type: 'aadhar', url: idUrl.trim() });
    if (selfieUrl.trim()) payload.push({ type: 'selfie', url: selfieUrl.trim() });
    if (expUrl.trim()) payload.push({ type: 'experience', url: expUrl.trim() });
    if (!payload.length) {
      setError('Please add at least ID proof or selfie URL.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await beauticianApi.submitKyc(payload);
      await refreshKyc();
      setIdUrl('');
      setSelfieUrl('');
      setExpUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit documents');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <div className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <Shield className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Account verification</h1>
          <p className="text-xs text-muted-foreground">
            Upload your KYC documents. Admin will review and approve.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            {status === 'approved' ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : status === 'rejected' ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <Shield className="w-5 h-5 text-warning" />
            )}
            <p className="text-sm font-medium text-foreground">Status: {status.toUpperCase()}</p>
          </div>
          {status === 'pending' && (
            <p className="text-xs text-muted-foreground">
              Your documents are under review. You will start receiving jobs once admin approves your profile.
            </p>
          )}
          {status === 'rejected' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Some documents were rejected. Please check reasons below and re-upload.</p>
              {docs
                .filter((d) => d.status === 'rejected')
                .map((d) => (
                  <div key={d.id} className="mt-1 rounded-md bg-destructive/5 px-2 py-1">
                    <p className="font-medium text-destructive text-xs">{d.type.toUpperCase()}</p>
                    {d.notes && <p className="text-[11px] text-destructive/90">Reason: {d.notes}</p>}
                  </div>
                ))}
            </div>
          )}
          {status === 'approved' && (
            <Button size="sm" className="mt-2" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <UploadCloud className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Upload document links</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            For now, paste file URLs (from your storage like Google Drive / S3). In production this will be a proper file
            uploader.
          </p>
          <div className="space-y-2">
            <Input
              placeholder="ID proof URL (Aadhar / PAN)"
              value={idUrl}
              onChange={(e) => setIdUrl(e.target.value)}
            />
            <Input
              placeholder="Selfie URL"
              value={selfieUrl}
              onChange={(e) => setSelfieUrl(e.target.value)}
            />
            <Input
              placeholder="Experience certificate URL (optional)"
              value={expUrl}
              onChange={(e) => setExpUrl(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            className="w-full h-10 mt-2"
            onClick={handleSubmitDocs}
            disabled={saving}
          >
            {saving ? 'Submitting...' : 'Submit / Re-submit documents'}
          </Button>
        </div>
      </div>
    </div>
  );
}

