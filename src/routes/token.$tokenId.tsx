import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/bl/require-auth";
import { AiBadge, CrowdPill } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSector } from "@/lib/bheedless/data";
import { crowdLevel, predictWait } from "@/lib/bheedless/engine";
import { estimatedTurn, useApp } from "@/lib/bheedless/store";

export const Route = createFileRoute("/token/$tokenId")({
  head: () => ({
    meta: [
      { title: "Live Queue Tracking — BheedLess" },
      {
        name: "description",
        content:
          "Track your digital token in real time: position, people ahead and AI-estimated waiting time.",
      },
      { property: "og:title", content: "Live Queue Tracking — BheedLess" },
      { property: "og:description", content: "Your token, your position, your estimated turn." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TokenPage />
    </RequireAuth>
  ),
});

function TokenPage() {
  const { tokenId } = Route.useParams();
  const { tokens, services, leaveQueue, callNext } = useApp();
  const navigate = useNavigate();
  const token = tokens.find((t) => t.id === tokenId);

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Token not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This token may have been released or the demo data was reset.
        </p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/services">Take a new token</Link>
        </Button>
      </div>
    );
  }

  const svc = services[token.serviceId];
  const sector = getSector(token.sectorId);
  const peopleAhead = svc
    ? Math.max(0, Number(token.numeric) - svc.nowServing - 1)
    : 0;
  const effectiveAhead = token.priority ? Math.min(peopleAhead, 2) : peopleAhead;
  const prediction = svc ? predictWait(svc, effectiveAhead) : null;
  const total = Math.max(1, token.positionAtJoin);
  const progress = Math.min(100, Math.round(((total - effectiveAhead) / total) * 100));
  const cancelled = token.status === "cancelled";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Your token number
              </p>
              <p className="mt-2 text-6xl font-bold text-primary glow-text">{token.number}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {token.serviceName} · {sector?.organization}
              </p>
            </div>
            {svc ? <CrowdPill level={crowdLevel(svc.waiting)} /> : null}
          </div>

          {token.priority ? (
            <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
              <strong className="text-accent-foreground">Priority lane active.</strong> Senior
              citizens and differently-abled visitors are called ahead of the general queue.
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Box label="Now serving" value={svc ? `${sector?.prefix}-${svc.nowServing}` : "—"} />
            <Box label="People ahead" value={cancelled ? "—" : effectiveAhead} accent />
            <Box
              label="Estimated wait"
              value={cancelled || !prediction ? "—" : `${prediction.minutes} min`}
              accent
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Queue progress</span>
              <span>{cancelled ? "Released" : `${progress}%`}</span>
            </div>
            <Progress value={cancelled ? 0 : progress} className="mt-2 h-3" />
            {prediction && !cancelled ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Estimated turn at{" "}
                <span className="font-semibold text-foreground">
                  {estimatedTurn(prediction.minutes)}
                </span>
                . You will be alerted when 2 people remain ahead of you.
              </p>
            ) : null}
          </div>

          {prediction ? (
            <div className="mt-8 rounded-2xl border border-border bg-background/40 p-5">
              <AiBadge>How this estimate is calculated</AiBadge>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {prediction.factors.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                People Ahead × Average Service Time ÷ Active Counters, adjusted for crowd level and
                time of day. Confidence {prediction.confidence}%.
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={cancelled || !svc}
              onClick={() => {
                if (svc) {
                  callNext(svc.id);
                  toast.info("Counter called the next token");
                }
              }}
            >
              Simulate counter progress
            </Button>
            <Button
              variant="destructive"
              disabled={cancelled}
              onClick={() => {
                leaveQueue(token.id);
                toast.success("You left the queue", {
                  description: "Your slot has been released to the next person.",
                });
                navigate({ to: "/dashboard" });
              }}
            >
              Leave Queue
            </Button>
          </div>
        </div>

        <div className="glass-card flex flex-col items-center rounded-3xl p-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Digital token pass
          </p>
          <div className="mt-6 rounded-2xl bg-white p-4">
            <QRCodeSVG
              value={`BHEEDLESS|${token.number}|${token.serviceName}|${token.holder}`}
              size={168}
              level="M"
            />
          </div>
          <p className="mt-5 text-sm font-semibold">{token.holder}</p>
          <p className="text-xs text-muted-foreground">
            Show this QR code at the counter for verification.
          </p>
          <div className="mt-6 w-full rounded-2xl border border-border bg-background/40 p-4 text-left text-sm">
            <Row label="Status" value={cancelled ? "Cancelled" : "Waiting"} />
            <Row label="Issued at" value={new Date(token.joinedAt).toLocaleTimeString()} />
            <Row label="Lane" value={token.priority ? "Priority" : "General"} />
          </div>
          <Button variant="ghost" className="mt-6 w-full" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Box({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={accent ? "mt-1 text-2xl font-bold text-primary" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
