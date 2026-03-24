import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { kyc } = useApp();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Documents</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-sm text-foreground">KYC Status: <span className="font-semibold capitalize">{kyc?.kycStatus || 'pending'}</span></p>
        </div>
      </div>

      <div className="space-y-3">
        {(kyc?.documents || []).length > 0 ? (
          kyc?.documents.map((doc) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border shadow-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <p className="font-medium capitalize">{doc.type}</p>
                </div>
                <p className="text-xs capitalize text-muted-foreground">{doc.status}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 break-all">{doc.url}</p>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card p-6 text-center text-sm text-muted-foreground">
            No documents found. Upload from KYC section.
          </div>
        )}
      </div>
    </div>
  );
}
