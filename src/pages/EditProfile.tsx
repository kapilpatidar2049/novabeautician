import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditProfile() {
  const navigate = useNavigate();
  const { beautician, updateProfile } = useApp();
  const [name, setName] = useState(beautician.name);
  const [phone, setPhone] = useState(beautician.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    setSuccess('');
    setSaving(true);
    const result = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaving(false);
    if (result.ok) {
      setSuccess('Profile updated successfully');
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Name</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Phone</p>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter mobile number" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Working City</p>
          <Input value={beautician.city || 'City not set'} disabled />
          <p className="text-xs text-muted-foreground mt-1">City is managed by admin for service assignment.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
