import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { SectorDef } from "@/lib/bheedless/data";
import { useApp } from "@/lib/bheedless/store";
import { CrowdPill } from "./brand";
import { crowdLevel } from "@/lib/bheedless/engine";

export function SectorCard({ sector }: { sector: SectorDef }) {
  const { sectorStats } = useApp();
  const stats = sectorStats(sector.id);

  return (
    <Link
      to="/sector/$sectorId"
      params={{ sectorId: sector.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={sector.image}
          alt={`${sector.name} service center`}
          loading="lazy"
          width={1600}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 image-tint" />
        <span className="absolute left-4 top-4 rounded-xl bg-background/70 px-3 py-1.5 text-lg backdrop-blur">
          {sector.icon}
        </span>
        <div className="absolute bottom-3 right-3">
          <CrowdPill level={crowdLevel(Math.round(stats.waiting / 4))} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold">{sector.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{sector.tagline}</p>

        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-primary">{stats.waiting}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.avgWait} min</p>
            <p className="text-xs text-muted-foreground">Avg. wait</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {sector.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
          {sector.services.length > 3 ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
              +{sector.services.length - 3} more
            </span>
          ) : null}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Open dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
