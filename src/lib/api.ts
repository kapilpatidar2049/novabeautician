const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("beautician_token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("beautician_refresh_token");
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("beautician_token", accessToken);
  localStorage.setItem("beautician_refresh_token", refreshToken);
}

export function clearAuth() {
  localStorage.removeItem("beautician_token");
  localStorage.removeItem("beautician_refresh_token");
  localStorage.removeItem("beautician_user");
}

export function setUser(user: { id: string; name: string; email: string; phone?: string }) {
  localStorage.setItem("beautician_user", JSON.stringify(user));
}

export function getUser(): { id: string; name: string; email: string; phone?: string } | null {
  const s = localStorage.getItem("beautician_user");
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const { params, ...init } = options;
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  // Only set JSON content type when not sending FormData (for file uploads)
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { ...init, headers });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshToken();
    if (refreshed) return request<T>(path, options);
  }

  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

async function refreshToken(): Promise<boolean> {
  const ref = getRefreshToken();
  if (!ref) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: ref }),
    });
    const json = await res.json();
    if (json.success && json.data?.tokens) {
      setAuthTokens(json.data.tokens.accessToken, json.data.tokens.refreshToken);
      if (json.data.user) setUser(json.data.user);
      return true;
    }
  } catch {
    // ignore
  }
  clearAuth();
  return false;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{
      user: { id: string; name: string; email: string; role: string; phone?: string };
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  sendOtp: (phone: string, fcmToken?: string | null) =>
    request<{ sent: boolean }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, role: "beautician", ...(fcmToken ? { fcmToken } : {}) }),
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<{
      user: { id: string; name: string; email: string; role: string; phone?: string };
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp, role: "beautician" }) }),
  registerFcmToken: (token: string) =>
    request("/auth/fcm-token", { method: "POST", body: JSON.stringify({ token }) }),
  registerBeautician: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: { id: string; name: string; email: string; phone?: string; role: string; isActive: boolean } }>("/auth/register-beautician", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getProfile: () =>
    request<{ _id: string; name: string; email: string; phone?: string; city?: string | { _id: string; name?: string } }>("/auth/profile"),
  updateProfile: (body: { name?: string; phone?: string }) =>
    request<{ _id: string; name: string; email: string; phone?: string }>("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export interface ApiAppointment {
  _id: string;
  customer: { _id: string; name: string; email?: string; phone?: string };
  service: { _id: string; name: string; basePrice: number; durationMinutes: number };
  scheduledAt: string;
  address: string;
  status: string;
  price: number;
  notes?: string;
  location?: { coordinates: [number, number] };
}

export interface ApiKycDocument {
  id: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export interface ApiKycStatus {
  kycStatus: 'pending' | 'approved' | 'rejected';
  documents: ApiKycDocument[];
}

export const beauticianApi = {
  getAppointments: (page = 1, limit = 50, status = "") =>
    request<{ items: ApiAppointment[]; meta: unknown }>("/beautician/appointments", {
      params: { page: String(page), limit: String(limit), status },
    }),
  acceptAppointment: (id: string) =>
    request<ApiAppointment>(`/beautician/appointments/${id}/accept`, { method: "PUT" }),
  rejectAppointment: (id: string) =>
    request<ApiAppointment>(`/beautician/appointments/${id}/reject`, { method: "PUT" }),
  startAppointment: (id: string) =>
    request<ApiAppointment>(`/beautician/appointments/${id}/start`, { method: "PUT" }),
  completeAppointment: (id: string) =>
    request<ApiAppointment>(`/beautician/appointments/${id}/complete`, { method: "PUT" }),
  updateLocation: (body: { appointmentId: string; lat: number; lng: number }) =>
    request("/beautician/location/update", { method: "POST", body: JSON.stringify(body) }),
  setAvailability: (isAvailable: boolean) =>
    request<{ isAvailable: boolean }>("/beautician/availability", {
      method: "POST",
      body: JSON.stringify({ isAvailable }),
    }),
  getKyc: () => request<ApiKycStatus>("/beautician/kyc"),
  submitKyc: (documents: Array<{ type: string; url: string }>) =>
    request<ApiKycStatus>("/beautician/kyc", {
      method: "POST",
      body: JSON.stringify({ documents }),
    }),
  uploadKycDocuments: (files: { idFile?: File | null; selfieFile?: File | null; expFile?: File | null }) => {
    const formData = new FormData();
    if (files.idFile) formData.append("aadhar", files.idFile);
    if (files.selfieFile) formData.append("selfie", files.selfieFile);
    if (files.expFile) formData.append("experience", files.expFile);
    return request<{ documents: Array<{ type: string; url: string }> }>("/beautician/kyc/upload", {
      method: "POST",
      body: formData,
    });
  },
};
