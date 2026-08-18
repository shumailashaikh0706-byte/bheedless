import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/bl/require-auth";
import { AiBadge, PageHeader } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSector } from "@/lib/bheedless/data";
import { predictWait } from "@/lib/bheedless/engine";
import { nextSlots, useApp } from "@/lib/bheedless/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$serviceId")({
  head: () => ({
    meta: [
      { title: "Confirm Your Appointment — BheedLess" },
      {
        name: "description",
        content:
          "Pick a date and time slot, review your saved details and confirm your BheedLess appointment.",
      },
      { property: "og:title", content: "Confirm Your Appointment — BheedLess" },
      { property: "og:description", content: "Reserve your slot with live wait predictions." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BookService />
    </RequireAuth>
  ),
});

function BookService() {
  const { serviceId } = Route.useParams();
  const { services, user, bookAppointment } = useApp();
  const navigate = useNavigate();
  const svc = services[serviceId];
  const sector = svc ? getSector(svc.sectorId) : undefined;

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const slots = useMemo(() => nextSlots(12, 9), []);

  if (!svc || !sector) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/book">Back to booking</Link>
        </Button>
      </div>
    );
  }

  const prediction = predictWait(svc, Math.round(svc.waiting * 0.35));
  const age = user?.dateOfBirth
    ? (Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 86400000)
    : 30;
  const isMinor = age < 18;

  const confirm = () => {
    if (!time) {
      toast.error("Please select a time slot");
      return;
    }
    const appt = bookAppointment({
      sectorId: svc.sectorId,
      serviceId: svc.id,
      serviceName: svc.name,
      date,
      time,
    });
    if (appt) {
      toast.success(`Appointment confirmed — ${appt.id}`, {
        description: isMinor
          ? "A guardian alert has been sent for approval."
          : `${svc.name} on ${appt.date} at ${appt.time}.`,
      });
      navigate({ to: "/appointments" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        title={`Book — ${svc.name}`}
        subtitle={`${sector.icon} ${sector.organization}`}
      />

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="glass-card rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" /> Choose date & time
            </h2>
            <div className="mt-5 max-w-xs space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Available time slots</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm transition-colors",
                    !s.available && "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through",
                    s.available && time === s.time
                      ? "border-primary bg-primary/20 font-semibold text-primary"
                      : s.available && "border-border hover:border-primary/60 hover:bg-primary/10",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Prefilled from your saved profile — no need to type them again.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ReadField label="Full name" value={user?.fullName ?? ""} />
              <ReadField label="Phone" value={user?.phone ?? ""} />
              <ReadField label="Email" value={user?.email ?? ""} />
              <ReadField
                label="Priority category"
                value={
                  user?.accessibility === "senior"
                    ? "Senior citizen"
                    : user?.accessibility === "disability"
                      ? "Differently-abled"
                      : "General"
                }
              />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Reason for visit (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the counter staff should know in advance"
              />
            </div>
            <Button variant="ghost" className="mt-4" asChild>
              <Link to="/profile">Update my profile</Link>
            </Button>
          </section>

          {isMinor ? (
            <div className="rounded-3xl border border-warning/40 bg-warning/10 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <ShieldCheck className="h-4 w-4" /> Guardian approval required
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                An instant alert will be sent to {user?.guardianName ?? "your registered guardian"} (
                {user?.guardianPhone ?? "guardian contact"}). The appointment remains pending until
                it is approved.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <SumRow label="Sector" value={sector.name} />
              <SumRow label="Service" value={svc.name} />
              <SumRow label="Date" value={date} />
              <SumRow label="Time" value={time || "Not selected"} />
              <SumRow label="Counters open" value={`${svc.activeCounters} / ${svc.counters}`} />
            </dl>

            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <AiBadge>Predicted waiting time</AiBadge>
              <p className="mt-2 text-3xl font-bold text-primary">{prediction.minutes} min</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Booked visitors skip most of the walk-in queue. Confidence {prediction.confidence}%.
              </p>
            </div>

            <Button variant="hero" size="lg" className="mt-6 w-full" onClick={confirm}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Appointment
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Free cancellation up to 10 minutes before your slot.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
