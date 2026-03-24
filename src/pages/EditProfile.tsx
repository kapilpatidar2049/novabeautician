import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-24 h-24 border-2 border-border">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" className="object-cover" /> : null}
            <AvatarFallback className="text-2xl font-bold">{name.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Camera className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading…' : 'Change photo'}
          </Button>
        </div>
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
