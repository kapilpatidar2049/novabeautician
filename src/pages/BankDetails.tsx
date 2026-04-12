import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { beauticianApi } from '@/lib/api';
import { toast } from 'sonner';

export default function BankDetails() {
  const navigate = useNavigate();
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    beauticianApi.getBankDetails()
      .then(res => {
        if (res.success && res.data) {
          setAccountHolderName(res.data.accountHolderName || '');
          setAccountNumber(res.data.accountNumber || '');
          setIfscCode(res.data.ifscCode || '');
          setUpiId(res.data.upiId || '');
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    if (!accountHolderName || !accountNumber || !ifscCode) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await beauticianApi.updateBankDetails({
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId
      });
      if (res.success) {
        toast.success('Bank details saved successfully');
      } else {
        toast.error('Failed to save bank details');
      }
    } catch (e) {
      toast.error('Error saving bank details');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Bank Details</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm bg-secondary/30 p-3 rounded-lg">
          <Landmark className="w-4 h-4 text-primary" />
          <span>Use this account for all your earnings settlement.</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Account Holder Name</label>
            <Input placeholder="As per bank passbook" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="h-12" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Account Number</label>
            <Input placeholder="Enter your bank account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="h-12" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">IFSC Code</label>
            <Input placeholder="e.g. SBIN0001234" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="h-12" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">UPI ID (Optional)</label>
            <Input placeholder="e.g. username@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="h-12" />
          </div>
        </div>

        <Button className="w-full h-12 gradient-primary shadow-button font-bold mt-2" onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Bank Details
        </Button>
      </div>
    </div>
  );
}
