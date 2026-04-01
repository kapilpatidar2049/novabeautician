import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Play, Package, Flag, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Appointment, JobStatus, ProductUsage } from "@/types";
import { useApp } from "@/context/AppContext";
import { beauticianApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductUsageModal } from "./ProductUsageModal";

interface ServiceExecutionFlowProps {
  appointment: Appointment;
}

const flowSteps: { status: JobStatus; label: string; icon: React.ElementType }[] = [
  { status: "accepted", label: "Accepted — go to customer", icon: CheckCircle2 },
  { status: "in_transit", label: "On the way", icon: Navigation },
  { status: "reached", label: "Arrived — customer shows OTP", icon: MapPin },
  { status: "in_progress", label: "Service in progress", icon: Play },
  { status: "completed", label: "Complete & record products", icon: Flag },
];

export function ServiceExecutionFlow({ appointment }: ServiceExecutionFlowProps) {
  const { updateAppointmentStatus, refreshAppointments } = useApp();
  const navigate = useNavigate();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const getStepIndex = (status: JobStatus) => {
    const idx = flowSteps.findIndex((s) => s.status === status);
    return idx >= 0 ? idx : -1;
  };

  const currentStepIndex = getStepIndex(appointment.status);
  const nextStep = currentStepIndex >= 0 ? flowSteps[currentStepIndex + 1] : undefined;

  const handleNextStep = () => {
    if (!nextStep) return;
    if (nextStep.status === "completed") {
      setShowProductModal(true);
      return;
    }
    if (nextStep.status === "in_progress") {
      setOtp("");
      setShowOtpDialog(true);
      return;
    }
    void updateAppointmentStatus(appointment.id, nextStep.status);
  };

  const handleOtpSubmit = async () => {
    const code = otp.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from the customer’s booking screen");
      return;
    }
    setOtpSubmitting(true);
    try {
      await beauticianApi.verifyServiceOtp(appointment.id, code);
      await refreshAppointments();
      setShowOtpDialog(false);
      setOtp("");
      toast.success("Service started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleCompleteWithProducts = async (products: ProductUsage[]) => {
    setShowProductModal(false);
    try {
      for (const p of products) {
        if (p.quantity <= 0) continue;
        await beauticianApi.recordProductUsage({
          inventoryItemId: p.id,
          quantityUsed: p.quantity,
        });
      }
      const ok = await updateAppointmentStatus(appointment.id, "completed");
      if (ok) {
        navigate(`/appointment/${appointment.id}/rate-customer`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not finish service");
    }
  };

  if (appointment.status === "completed") {
    return (
      <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
        <h3 className="font-semibold text-success text-lg">Service Completed!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Great job! Payment will be processed shortly.
        </p>
        {appointment.needsBeauticianRating && (
          <Button className="w-full" onClick={() => navigate(`/appointment/${appointment.id}/rate-customer`)}>
            Rate customer (required)
          </Button>
        )}
      </div>
    );
  }

  if (appointment.status === "cancelled") {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-destructive text-lg">Job Cancelled</h3>
        <p className="text-sm text-muted-foreground mt-1">This appointment has been cancelled.</p>
      </div>
    );
  }

  const primaryLabel =
    nextStep?.status === "in_transit"
      ? "Go for service"
      : nextStep?.status === "reached"
        ? "Reached location"
        : nextStep?.status === "in_progress"
          ? "Start service (OTP)"
          : nextStep?.status === "completed"
            ? "End service & products"
            : nextStep?.label ?? "Next";

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        <h4 className="font-semibold text-foreground mb-4">Service Progress</h4>

        <div className="space-y-3 mb-6">
          {flowSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrentHalo = index === currentStepIndex + 1;
            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isCompleted && "bg-success/10",
                  isCurrentHalo && "bg-primary/10 ring-1 ring-primary/30",
                  !isCompleted && !isCurrentHalo && "opacity-50",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isCompleted && "bg-success text-success-foreground",
                    isCurrentHalo && "gradient-primary text-primary-foreground",
                    !isCompleted && !isCurrentHalo && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm",
                    isCompleted && "text-success",
                    isCurrentHalo && "text-primary",
                    !isCompleted && !isCurrentHalo && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {nextStep && (
          <Button
            onClick={handleNextStep}
            className="w-full gradient-primary text-primary-foreground shadow-button h-12 text-base"
          >
            {nextStep.status === "completed" && <Package className="w-5 h-5 mr-2" />}
            {primaryLabel}
          </Button>
        )}
      </div>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer’s service code</DialogTitle>
            <DialogDescription>
              Ask the customer to open their order and read the 6-digit code. It appears after you mark arrival.
            </DialogDescription>
          </DialogHeader>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-[0.5em] font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setShowOtpDialog(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={otpSubmitting} onClick={() => void handleOtpSubmit()}>
              {otpSubmitting ? "Checking…" : "Verify & start"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductUsageModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleCompleteWithProducts}
      />
    </>
  );
}
