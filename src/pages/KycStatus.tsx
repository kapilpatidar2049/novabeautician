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

  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [expFile, setExpFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitDocs = async () => {
    if (!idFile && !selfieFile && !expFile) {
      setError('Please upload at least ID proof or selfie image.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const uploadRes = await beauticianApi.uploadKycDocuments({
        idFile,
        selfieFile,
        expFile,
      });
      const documents = uploadRes.data?.documents || [];
      if (!documents.length) {
        setError('No files were uploaded. Please try again.');
        return;
      }
      await beauticianApi.submitKyc(documents);
      await refreshKyc();
      setIdFile(null);
      setSelfieFile(null);
      setExpFile(null);
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
            <p className="text-sm font-medium text-foreground">Upload document images</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Upload clear photos of your ID proof, selfie and experience certificate. Supported formats: JPG, PNG.
          </p>
          <div className="space-y-2">
            <span>ID Proof</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setIdFile(e.target.files?.[0] || null)}
            />
            <span>Selfie</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
            />
            <span>Experience Certificate (Optional)</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setExpFile(e.target.files?.[0] || null)}
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

