import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, CalendarClock, Clock, Ticket } from "lucide-react";
import { RequireAuth } from "@/components/bl/require-auth";
import { PageHeader, SectionTitle, StatCard } from "@/components/bl/brand";
import { SectorCard } from "@/components/bl/sector-card";
import { Button } from "@/components/ui/button";
import { SECTORS } from "@/lib/bheedless/data";
import { useApp } from "@/lib/bheedless/store";
import { formatTime, predictWait } from "@/lib/bheedless/engine";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — BheedLess" },
      {
        name: "description",
        content: "Your active token, estimated wait, next appointment and unread alerts at a glance.",
      },
      { property: "og:title", content: "Your BheedLess Dashboard" },
      { property: "og:description", content: "Tokens, appointments and live wait estimates." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function DashboardPage() {
  const { user, activeToken, services, appointments, unreadCount } = useApp();
  const svc = activeToken ? services[activeToken.serviceId] : undefined;
  const peopleAhead = svc
    ? Math.max(0, Number(activeToken?.numeric ?? 0) - svc.nowServing - 1)
    : 0;
  const wait = svc ? predictWait(svc, peopleAhead).minutes : null;

  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];

  const nextTime = upcoming
    ? formatTime(new Date(`${upcoming.date}T${upcoming.time}:00`))
    : "None";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        title={
          <>
            {greeting()}, {user?.fullName.split(" ")[0]} 👋
          </>
        }
        subtitle="Welcome to BheedLess — your time matters."
        right={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/appointments">My Appointments</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/book">Book Appointment</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Token"
          value={activeToken ? activeToken.number : "—"}
          hint={activeToken ? activeToken.serviceName : "No token in the queue"}
          icon={<Ticket className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Estimated Waiting"
          value={wait !== null ? `${wait} min` : "—"}
          hint={activeToken ? `${peopleAhead} people ahead` : "Join a queue to see this"}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Next Appointment"
          value={nextTime}
          hint={upcoming ? `${upcoming.serviceName} · ${upcoming.id}` : "Nothing scheduled"}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          label="Notifications"
          value={`${unreadCount} unread`}
          hint="Tap to open the notification center"
          icon={<BellRing className="h-4 w-4" />}
        />
      </div>

      {activeToken ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/40 bg-primary/10 p-6">
          <div>
            <p className="text-sm text-muted-foreground">You are currently in a queue</p>
            <p className="text-2xl font-bold text-primary">
              {activeToken.number} · {activeToken.serviceName}
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/token/$tokenId" params={{ tokenId: activeToken.id }}>
              Track Queue
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-16">
        <SectionTitle title="Choose a Service" subtitle="Live crowd data across all five sectors." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((s) => (
            <SectorCard key={s.id} sector={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
