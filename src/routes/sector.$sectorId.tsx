import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Users } from "lucide-react";
import { AiBadge, CrowdPill, StatCard } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { getSector, sectorAnalytics, type SectorId } from "@/lib/bheedless/data";
import { crowdLevel, predictWait } from "@/lib/bheedless/engine";
import { useApp } from "@/lib/bheedless/store";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/sector/$sectorId")({
  loader: ({ params }) => {
    const sector = getSector(params.sectorId);
    if (!sector) throw notFound();
    return { name: sector.name, tagline: sector.tagline };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} Queues — BheedLess` : "Sector — BheedLess";
    const description = loaderData
      ? `${loaderData.tagline} See live crowd levels, AI wait predictions and take a digital token.`
      : "Live queue information on BheedLess.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SectorPage,
});

function SectorPage() {
  const { sectorId } = Route.useParams();
  const sector = getSector(sectorId)!;
  const { servicesBySector, sectorStats, joinQueue, user } = useApp();
  const navigate = useNavigate();
  const list = servicesBySector(sector.id as SectorId);
  const stats = sectorStats(sector.id as SectorId);
  const analytics = sectorAnalytics[sector.id as SectorId];

  const take = (svcId: string) => {
    if (!user) {
      toast.error("Please log in to take a token");
      navigate({ to: "/login" });
      return;
    }
    const priority = user.accessibility !== "none";
    const token = joinQueue(svcId, priority);
    if (token) {
      toast.success(`Token ${token.number} issued`, {
        description: priority ? "Priority lane — you will be called next." : "Track your position live.",
      });
      navigate({ to: "/token/$tokenId", params: { tokenId: token.id } });
    }
  };

  return (
    <div>
      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={sector.image}
          alt={`${sector.name} service area`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 image-tint" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
            <p className="text-sm text-muted-foreground">{sector.organization}</p>
            <h1 className="mt-1 text-4xl font-bold sm:text-5xl">
              <span className="mr-3">{sector.icon}</span>
              {sector.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{sector.tagline}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="People waiting" value={stats.waiting} icon={<Users className="h-4 w-4" />} accent />
          <StatCard label="Average wait" value={`${stats.avgWait} min`} hint="AI-predicted across services" />
          <StatCard
            label="Counters open"
            value={`${stats.activeCounters} / ${stats.counters}`}
            hint="Live counter utilisation"
          />
          <StatCard label="Slots available today" value={stats.slots} hint="Bookable appointment slots" />
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each service has its own queue, counters and AI prediction.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {list.map((svc) => {
              const p = predictWait(svc);
              return (
                <div key={svc.id} className="glass-card rounded-3xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{svc.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Now serving <span className="text-foreground">{sector.prefix}-{svc.nowServing}</span> ·{" "}
                        {svc.waiting} in queue
                      </p>
                    </div>
                    <CrowdPill level={crowdLevel(svc.waiting)} />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <Metric label="Est. wait" value={`${p.minutes} min`} accent />
                    <Metric label="Counters" value={`${svc.activeCounters}/${svc.counters}`} />
                    <Metric label="Avg. service" value={`${svc.avgServiceTime} min`} />
                  </div>

                  <div className="mt-4">
                    <AiBadge>Prediction confidence {p.confidence}%</AiBadge>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="hero" onClick={() => take(svc.id)}>
                      Take Digital Token
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/book/$serviceId" params={{ serviceId: svc.id }}>
                        Book Appointment
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold">Average waiting time by hour</h3>
            <p className="text-xs text-muted-foreground">Historical data — last 30 days</p>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.waitLine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="wait" stroke="var(--primary)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold">Visitors per day</h3>
            <p className="text-xs text-muted-foreground">Historical data — last week</p>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.visitorsBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="visitors" fill="var(--accent-neon)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-primary/30 bg-primary/10 p-6">
          <AiBadge>BheedLess AI insight</AiBadge>
          <p className="mt-3 text-sm text-foreground/90">{analytics.insight}</p>
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/services">
              Browse other sectors <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={accent ? "mt-1 font-bold text-primary" : "mt-1 font-bold"}>{value}</p>
    </div>
  );
}
