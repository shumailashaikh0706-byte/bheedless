import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/bl/require-auth";
import { CrowdPill, PageHeader, StatCard } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECTORS, getSector, type SectorId } from "@/lib/bheedless/data";
import { crowdLevel, predictWait } from "@/lib/bheedless/engine";
import { useApp } from "@/lib/bheedless/store";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Counter Console — BheedLess Staff" },
      {
        name: "description",
        content:
          "Call the next token, open extra counters and keep the queue moving from the staff console.",
      },
      { property: "og:title", content: "BheedLess Counter Console" },
      { property: "og:description", content: "Serve visitors faster with live queue controls." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["staff", "admin"]}>
      <StaffPage />
    </RequireAuth>
  ),
});

function StaffPage() {
  const { servicesBySector, sectorStats, callNext, activateCounter } = useApp();
  const [sectorId, setSectorId] = useState<SectorId>("hospital");
  const sector = getSector(sectorId)!;
  const list = servicesBySector(sectorId);
  const stats = sectorStats(sectorId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        title="Counter Console"
        subtitle={`${sector.icon} ${sector.organization}`}
        right={
          <Select value={sectorId} onValueChange={(v) => setSectorId(v as SectorId)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="People waiting" value={stats.waiting} accent />
        <StatCard label="Average wait" value={`${stats.avgWait} min`} />
        <StatCard label="Counters open" value={`${stats.activeCounters} / ${stats.counters}`} />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {list.map((svc) => {
          const p = predictWait(svc);
          return (
            <div key={svc.id} className="glass-card rounded-3xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{svc.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {svc.waiting} waiting · est. {p.minutes} min
                  </p>
                </div>
                <CrowdPill level={crowdLevel(svc.waiting)} />
              </div>

              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Now serving
                </p>
                <p className="mt-2 text-4xl font-bold text-primary glow-text">
                  {sector.prefix}-{svc.nowServing}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="hero"
                  disabled={svc.waiting <= 0}
                  onClick={() => {
                    callNext(svc.id);
                    toast.success(`Called ${sector.prefix}-${svc.nowServing + 1}`);
                  }}
                >
                  Call next token
                </Button>
                <Button
                  variant="outline"
                  disabled={svc.activeCounters >= svc.counters}
                  onClick={() => {
                    activateCounter(svc.id);
                    toast.success("Extra counter opened");
                  }}
                >
                  Open extra counter ({svc.activeCounters}/{svc.counters})
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
