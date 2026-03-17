import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Phone, User as UserIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required fields (name, email, password).");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authApi.registerBeautician({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      if (res.success) {
        setSuccess("Registration submitted. Admin will approve your account. You can then log in.");
      } else {
        setError((res as { message?: string }).message || "Registration failed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Register as Beautician</h1>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Create your partner account. An admin will verify your details and activate your profile.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <UserIcon className="w-4 h-4" />
            </div>
            <Input
              placeholder="Full name"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              type="email"
              placeholder="Email address"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              type="password"
              placeholder="Password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="w-4 h-4" />
            </div>
            <Input
              type="tel"
              placeholder="Phone (optional)"
              className="pl-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              className="pl-10 pr-3 py-2 w-full rounded-md border border-input bg-background text-sm text-foreground"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Select city (optional)</option>
              <option value="Indore">Indore</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Ujjain">Ujjain</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button
          className="w-full h-11 mt-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit registration"}
        </Button>

        <button
          className="w-full text-xs text-muted-foreground mt-2 underline"
          onClick={() => navigate("/")}
        >
          Already registered? Go to login
        </button>
      </div>
    </div>
  );
}

