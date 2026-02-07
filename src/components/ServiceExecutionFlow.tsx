import { useState } from 'react';
import { CheckCircle2, Circle, MapPin, Play, Package, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Appointment, JobStatus, ProductUsage } from '@/types';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { ProductUsageModal } from './ProductUsageModal';

interface ServiceExecutionFlowProps {
  appointment: Appointment;
}

const flowSteps: { status: JobStatus; label: string; icon: React.ElementType }[] = [
  { status: 'accepted', label: 'Accept Job', icon: CheckCircle2 },
  { status: 'reached', label: 'Reached Location', icon: MapPin },
  { status: 'in_progress', label: 'Start Service', icon: Play },
  { status: 'completed', label: 'Complete Service', icon: Flag },
];

export function ServiceExecutionFlow({ appointment }: ServiceExecutionFlowProps) {
  const { updateAppointmentStatus } = useApp();
  const [showProductModal, setShowProductModal] = useState(false);
  const [productsUsed, setProductsUsed] = useState<ProductUsage[]>([]);

  const getStepIndex = (status: JobStatus) => {
    const idx = flowSteps.findIndex(s => s.status === status);
    return idx >= 0 ? idx : -1;
  };

  const currentStepIndex = getStepIndex(appointment.status);
  const nextStep = flowSteps[currentStepIndex + 1];

  const handleNextStep = () => {
    if (nextStep) {
      // Show product modal before completing
      if (nextStep.status === 'completed') {
        setShowProductModal(true);
      } else {
        updateAppointmentStatus(appointment.id, nextStep.status);
      }
    }
  };

  const handleCompleteWithProducts = (products: ProductUsage[]) => {
    setProductsUsed(products);
    setShowProductModal(false);
    updateAppointmentStatus(appointment.id, 'completed');
  };

  if (appointment.status === 'completed') {
    return (
      <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
        <h3 className="font-semibold text-success text-lg">Service Completed!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Great job! Payment will be processed shortly.
        </p>
      </div>
    );
  }

  if (appointment.status === 'cancelled') {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-destructive text-lg">Job Cancelled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This appointment has been cancelled.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        <h4 className="font-semibold text-foreground mb-4">Service Progress</h4>

        {/* Progress Steps */}
        <div className="space-y-3 mb-6">
          {flowSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex + 1;
            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  isCompleted && 'bg-success/10',
                  isCurrent && 'bg-primary/10 ring-1 ring-primary/30',
                  !isCompleted && !isCurrent && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    isCompleted && 'bg-success text-success-foreground',
                    isCurrent && 'gradient-primary text-primary-foreground',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'font-medium',
                    isCompleted && 'text-success',
                    isCurrent && 'text-primary',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {nextStep && (
          <Button
            onClick={handleNextStep}
            className="w-full gradient-primary text-primary-foreground shadow-button h-12 text-base"
          >
            {nextStep.status === 'completed' && <Package className="w-5 h-5 mr-2" />}
            {nextStep.label}
          </Button>
        )}
      </div>

      <ProductUsageModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleCompleteWithProducts}
      />
    </>
  );
}
