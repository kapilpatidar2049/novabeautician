import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'beautician_bank_details';

export default function BankDetails() {
  const navigate = useNavigate();
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  const [accountHolderName, setAccountHolderName] = useState(existing.accountHolderName || '');
  const [accountNumber, setAccountNumber] = useState(existing.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(existing.ifscCode || '');
  const [upiId, setUpiId] = useState(existing.upiId || '');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accountHolderName, accountNumber, ifscCode, upiId })
    );
    setMessage('Bank details saved');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Bank Details</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Landmark className="w-4 h-4" />
          Use this account for payout settlement
        </div>
        <Input placeholder="Account holder name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
        <Input placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        <Input placeholder="IFSC code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} />
        <Input placeholder="UPI ID (optional)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
        {message && <p className="text-sm text-green-600">{message}</p>}
        <Button className="w-full" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Bank Details
        </Button>
      </div>
    </div>
  );
}
