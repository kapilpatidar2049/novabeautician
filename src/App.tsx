import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import KycStatus from "./pages/KycStatus";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, kyc } = useApp();
  const location = useLocation();
  if (!isLoggedIn && location.pathname !== "/") return <Navigate to="/" replace />;
  const kycStatus = kyc?.kycStatus || "pending";
  if (isLoggedIn && kycStatus !== "approved" && location.pathname !== "/kyc") {
    return <Navigate to="/kyc" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <div className="max-w-md mx-auto min-h-screen bg-background shadow-xl">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/kyc" element={<ProtectedRoute><KycStatus /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
              <Route path="/appointment/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </HashRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
