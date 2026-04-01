import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { MapPin, Phone, User, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import alertSound from "@/alert.mp3";
import { cn } from "@/lib/utils";

export function JobOfferBottomSheet() {
  const { jobOfferAppointment, jobOfferExpiresAt, closeJobOffer, updateAppointmentStatus } = useApp();
  const open = !!jobOfferAppointment;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [acting, setActing] = useState<"accept" | "reject" | null>(null);

  useEffect(() => {
    if (!open || !jobOfferExpiresAt) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const ms = jobOfferExpiresAt.getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(ms / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [open, jobOfferExpiresAt]);

  useEffect(() => {
    if (!open) return;
    const audio = new Audio(alertSound);
    audio.loop = true;
    audio.volume = 0.85;
    void audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [open, jobOfferAppointment?.id]);

  useEffect(() => {
    if (!open || !jobOfferExpiresAt) return;
    if (secondsLeft > 0) return;
    const t = window.setTimeout(() => {
      closeJobOffer();
    }, 800);
    return () => window.clearTimeout(t);
  }, [open, jobOfferExpiresAt, secondsLeft, closeJobOffer]);

  const onAccept = useCallback(async () => {
    if (!jobOfferAppointment) return;
    setActing("accept");
    const ok = await updateAppointmentStatus(jobOfferAppointment.id, "accepted");
    setActing(null);
    if (ok) closeJobOffer();
  }, [jobOfferAppointment, updateAppointmentStatus, closeJobOffer]);

  const onReject = useCallback(async () => {
    if (!jobOfferAppointment) return;
    setActing("reject");
    const ok = await updateAppointmentStatus(jobOfferAppointment.id, "rejected");
    setActing(null);
    if (ok) closeJobOffer();
  }, [jobOfferAppointment, updateAppointmentStatus, closeJobOffer]);

  const mapsUrl =
    jobOfferAppointment &&
    `https://www.google.com/maps/search/?api=1&query=${jobOfferAppointment.customer.coordinates.lat},${jobOfferAppointment.customer.coordinates.lng}`;

  return (
    <Sheet open={open} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className={cn(
          "max-h-[90vh] overflow-y-auto rounded-t-2xl z-[200]",
          "[&>button]:hidden border-t-2 border-primary/30",
        )}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {jobOfferAppointment && (
          <>
            <SheetHeader className="text-left space-y-1 pr-8">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="text-xl">New booking request</SheetTitle>
                <span
                  className={cn(
                    "tabular-nums text-lg font-semibold px-3 py-1 rounded-full shrink-0",
                    secondsLeft <= 10 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
                  )}
                >
                  {secondsLeft}s
                </span>
              </div>
              <SheetDescription className="text-left">
                Accept within the time shown or the request will move to another beautician.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                <p className="font-semibold text-base">{jobOfferAppointment.services[0]?.name}</p>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{format(jobOfferAppointment.scheduledTime, "PPp")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Service location</p>
                    <p className="text-muted-foreground">{jobOfferAppointment.customer.address || "—"}</p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium mt-1 inline-block"
                      >
                        Open in Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{jobOfferAppointment.customer.name}</span>
                </div>
                {jobOfferAppointment.customer.phone ? (
                  <a
                    href={`tel:${jobOfferAppointment.customer.phone}`}
                    className="flex items-center gap-2 text-primary font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {jobOfferAppointment.customer.phone}
                  </a>
                ) : null}
              </div>

              <div className="flex gap-3 pt-2 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={!!acting || secondsLeft <= 0}
                  onClick={() => void onReject()}
                >
                  {acting === "reject" ? "…" : "Reject"}
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12"
                  disabled={!!acting || secondsLeft <= 0}
                  onClick={() => void onAccept()}
                >
                  {acting === "accept" ? "…" : "Accept"}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
