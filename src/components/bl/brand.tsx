import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { CrowdLevel } from "@/lib/bheedless/data";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      Bheed<span className="text-primary">Less</span>
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <p
        className={cn(
          "mt-3 text-3xl font-bold",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function CrowdPill({ level }: { level: CrowdLevel | string }) {
  const tone =
    level === "High"
      ? "bg-critical/15 text-critical"
      : level === "Medium" || level === "Moderate"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone)}>
      {level === "High" ? "🔴" : level === "Low" ? "🟢" : "🟡"} {level}
    </span>
  );
}

export function AiBadge({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <Sparkles className="h-3.5 w-3.5" />
      {children ?? "BheedLess AI"}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}
