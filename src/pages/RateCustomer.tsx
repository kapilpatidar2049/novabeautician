import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { beauticianApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export default function RateCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments, refreshAppointments } = useApp();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const appt = appointments.find((a) => a.id === id);
  const needsRating = appt?.needsBeauticianRating;

  const submit = async () => {
    if (!id || stars < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await beauticianApi.rateCustomer(id, { stars, comment: comment.trim() || undefined });
      if (res.success) {
        toast.success("Thanks! Your rating was submitted.");
        await refreshAppointments();
        navigate("/appointments", { replace: true });
      } else {
        toast.error(res.message || "Could not submit");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground">Rate customer</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <p className="text-sm text-muted-foreground">
          Rating the customer is required after each completed service. You cannot take new jobs until pending ratings are
          submitted.
        </p>

        {appt && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="font-medium text-foreground">{appt.customer.name}</p>
            <p className="text-sm text-muted-foreground">{appt.services.map((s) => s.name).join(", ")}</p>
          </div>
        )}

        {!needsRating && appt && (
          <p className="text-sm text-success">You have already rated this appointment.</p>
        )}

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Your rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  stars >= n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                )}
              >
                <Star className={cn("w-8 h-8", stars >= n && "fill-current")} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Comment (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="How was the experience?"
          />
        </div>

        <Button className="w-full" disabled={submitting || stars < 1 || !needsRating} onClick={() => void submit()}>
          {submitting ? "Submitting…" : "Submit rating"}
        </Button>
      </div>
    </div>
  );
}
