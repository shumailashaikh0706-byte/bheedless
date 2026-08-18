import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Activity, AlertTriangle, Gauge, Users, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RequireAuth } from "@/components/bl/require-auth";
import { AiBadge, CrowdPill, PageHeader, StatCard } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTORS, sectorAnalytics, serviceId, type SectorId } from "@/lib/bheedless/data";
import { crowdLevel, predictWait } from "@/lib/bheedless/engine";
import { useApp } from "@/lib/bheedless/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Operations Center — BheedLess Admin" },
      {
        name: "description",
        content:
          "Live crowd monitoring, AI recommendations, counter control and analytics for every BheedLess sector.",
      },
      { property: "og:title", content: "BheedLess Operations Center" },
      {
        property: "og:description",
        content: "Detect surges, activate counters and cut waiting times in real time.",
      },
    ],
  }),
  component: () => (
    <RequireAuth roles={["admin"]}>
      <AdminPage />
    </RequireAuth>
  ),
});

const PIE_COLORS = ["var(--primary)", "var(--accent)", "var(--success)", "var(--warning)", "var(--critical)"];

function AdminPage() {
  const {
    services,
    servicesBySector,
    sectorStats,
    simulateSurge,
    activateCounter,
    callNext,
    surgeActive,
    resetDemo,
  } = useApp();
  const [sectorId, setSectorId] = useState<SectorId>("hospital");
  const analytics = sectorAnalytics[sectorId];
  const stats = sectorStats(sectorId);
  const list = servicesBySector(sectorId);

  const hotspot = services[serviceId("hospital", "General Consultation")];
  const hotspotWait = hotspot ? predictWait(hotspot).minutes : 0;
  const canActivate = hotspot ? hotspot.activeCounters < hotspot.counters : false;

  const totalWaiting = Object.values(services).reduce((a, s) => a + s.waiting, 0);
  const openCounters = Object.values(services).reduce((a, s) => a + s.activeCounters, 0);
  const allCounters = Object.values(services).reduce((a, s) => a + s.counters, 0);
  const avgWait = Math.round(
    Object.values(services).reduce((a, s) => a + predictWait(s).minutes, 0) /
      Object.values(services).length,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        title="Operations Center"
        subtitle="Live crowd intelligence across all BheedLess locations."
        right={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetDemo}>
              Reset demo
            </Button>
            <Button variant="neon" onClick={simulateSurge}>
              <Zap className="mr-2 h-4 w-4" /> Simulate Crowd Surge
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="People waiting now" value={totalWaiting} icon={<Users className="h-4 w-4" />} accent />
        <StatCard label="Average wait" value={`${avgWait} min`} icon={<Gauge className="h-4 w-4" />} />
        <StatCard
          label="Counters open"
          value={`${openCounters} / ${allCounters}`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="System status"
          value={surgeActive ? "Surge" : "Stable"}
          hint={surgeActive ? "AI recommendation pending" : "All sectors within targets"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {surgeActive ? (
        <div className="mt-6 rounded-3xl border border-critical/40 bg-critical/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="destructive">Crowd surge detected</Badge>
              <h2 className="mt-3 text-lg font-semibold">
                Hospital · General Consultation is overloaded
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotspot?.waiting} people waiting · estimated wait {hotspotWait} min on{" "}
                {hotspot?.activeCounters} of {hotspot?.counters} counters.
              </p>
              <div className="mt-4">
                <AiBadge>
                  Recommendation: activate Counter #{(hotspot?.activeCounters ?? 0) + 1} to cut the
                  wait
                </AiBadge>
              </div>
            </div>
            <Button
              variant="hero"
              disabled={!canActivate}
              onClick={() => {
                if (hotspot) {
                  activateCounter(hotspot.id);
                  toast.success("Counter activated", {
                    description: "Waiting times recalculated and visitors notified.",
                  });
                }
              }}
            >
              Activate Counter
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-12">
        <Tabs value={sectorId} onValueChange={(v) => setSectorId(v as SectorId)}>
          <TabsList className="flex-wrap">
            {SECTORS.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.icon} {s.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={sectorId} className="mt-8 space-y-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {analytics.kpis.map((k) => (
                <StatCard key={k.label} label={k.label} value={k.value} />
              ))}
            </div>

            <div className="glass-card overflow-hidden rounded-3xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Waiting</th>
                    <th className="px-5 py-4">Now serving</th>
                    <th className="px-5 py-4">Counters</th>
                    <th className="px-5 py-4">Est. wait</th>
                    <th className="px-5 py-4">Crowd</th>
                    <th className="px-5 py-4 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((svc) => (
                    <tr key={svc.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-4 font-medium">{svc.name}</td>
                      <td className="px-5 py-4">{svc.waiting}</td>
                      <td className="px-5 py-4">{svc.nowServing}</td>
                      <td className="px-5 py-4">
                        {svc.activeCounters}/{svc.counters}
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">
                        {predictWait(svc).minutes} min
                      </td>
                      <td className="px-5 py-4">
                        <CrowdPill level={crowdLevel(svc.waiting)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => callNext(svc.id)}>
                            Call next
                          </Button>
                          <Button
                            size="sm"
                            variant="neon"
                            disabled={svc.activeCounters >= svc.counters}
                            onClick={() => {
                              activateCounter(svc.id);
                              toast.success(`Counter opened for ${svc.name}`);
                            }}
                          >
                            Open counter
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="glass-card rounded-3xl p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold">Waiting time by hour</h3>
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
                      <Line
                        type="monotone"
                        dataKey="wait"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold">Service distribution</h3>
                <p className="text-xs text-muted-foreground">Share of visitors</p>
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.distribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {analytics.distribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 lg:col-span-2">
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
                      <Bar dataKey="visitors" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6">
                <AiBadge>BheedLess AI insight</AiBadge>
                <p className="mt-3 text-sm text-foreground/90">{analytics.insight}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Sector load: {stats.waiting} waiting · {stats.activeCounters}/{stats.counters}{" "}
                  counters open.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
