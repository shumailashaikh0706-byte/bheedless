import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/bl/require-auth";
import { PageHeader } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSector } from "@/lib/bheedless/data";
import { CANCEL_WINDOW_MINUTES, canCancel, minutesUntil } from "@/lib/bheedless/engine";
import { useApp, type Appointment } from "@/lib/bheedless/store";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments — BheedLess" },
      {
        name: "description",
        content:
          "View upcoming, completed and cancelled appointments. Cancel free up to 10 minutes before your slot.",
      },
      { property: "og:title", content: "My Appointments — BheedLess" },
      { property: "og:description", content: "Manage every booking in one place." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppointmentsPage />
    </RequireAuth>
  ),
});

function AppointmentsPage() {
  const { appointments } = useApp();
  const by = (status: Appointment["status"]) => appointments.filter((a) => a.status === status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHeader
        title="My Appointments"
        subtitle="Everything you have booked across hospitals, banks, offices, colleges and passport centres."
        right={
          <Button variant="hero" asChild>
            <Link to="/book">New appointment</Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({by("upcoming").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({by("completed").length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({by("cancelled").length})</TabsTrigger>
        </TabsList>
        {(["upcoming", "completed", "cancelled"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-6 space-y-4">
            {by(status).length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Nothing here yet.
              </p>
            ) : (
              by(status).map((a) => <AppointmentRow key={a.id} appt={a} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const { cancelAppointment } = useApp();
  const sector = getSector(appt.sectorId);
  const mins = minutesUntil(appt.date, appt.time);
  const cancellable = appt.status === "upcoming" && canCancel(appt.date, appt.time);

  return (
    <div className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl">{sector?.icon}</span>
          <h3 className="font-semibold">{appt.serviceName}</h3>
          <Badge variant="outline">{appt.id}</Badge>
          {appt.guardianNotified ? <Badge variant="secondary">Guardian notified</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {sector?.organization} · {appt.date} at {appt.time} · est. wait {appt.estimatedWait} min
        </p>
        {appt.status === "upcoming" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {mins > 0 ? `Starts in ${mins} minutes` : "Slot time has passed"}
            {!cancellable
              ? ` · cancellation closed (within ${CANCEL_WINDOW_MINUTES} minutes of the slot)`
              : ""}
          </p>
        ) : null}
      </div>

      {appt.status === "upcoming" ? (
        <Button
          variant={cancellable ? "outline" : "ghost"}
          disabled={!cancellable}
          onClick={() => {
            const ok = cancelAppointment(appt.id);
            if (ok) {
              toast.success("Appointment cancelled", {
                description: "The slot has been released to other visitors.",
              });
            } else {
              toast.error("Cancellation window closed", {
                description: `Appointments can only be cancelled more than ${CANCEL_WINDOW_MINUTES} minutes before the slot.`,
              });
            }
          }}
        >
          {cancellable ? "Cancel" : "Cannot cancel"}
        </Button>
      ) : (
        <Badge variant={appt.status === "completed" ? "secondary" : "outline"}>
          {appt.status === "completed" ? "Completed" : "Cancelled"}
        </Badge>
      )}
    </div>
  );
}
