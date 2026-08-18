import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  CalendarCheck,
  QrCode,
  Accessibility,
  ShieldCheck,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { AiBadge, SectionTitle } from "@/components/bl/brand";
import { SectorCard } from "@/components/bl/sector-card";
import { SECTORS } from "@/lib/bheedless/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BheedLess — Less Bheed. Less Waiting. More Time." },
      {
        name: "description",
        content:
          "AI-powered queue and crowd management for hospitals, banks, offices, colleges and passport centers. Digital tokens, appointments and predicted waiting times.",
      },
      { property: "og:title", content: "BheedLess — AI Queue & Crowd Management" },
      {
        property: "og:description",
        content:
          "Book appointments, take digital tokens and see AI-estimated waiting times before you leave home.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    n: "01",
    title: "Choose a Service",
    body: "Select a hospital, bank, office, college, or passport/visa service.",
    icon: QrCode,
  },
  {
    n: "02",
    title: "Book or Join",
    body: "Book an appointment or take a digital token in seconds.",
    icon: CalendarCheck,
  },
  {
    n: "03",
    title: "Know Your Wait",
    body: "BheedLess AI predicts your waiting time from live queue data.",
    icon: BrainCircuit,
  },
  {
    n: "04",
    title: "Arrive at the Right Time",
    body: "Get notified and walk in exactly when your turn approaches.",
    icon: BellRing,
  },
];

function Index() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-accent/15 blur-[150px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <AiBadge>AI crowd intelligence</AiBadge>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] sm:text-6xl xl:text-7xl">
              Less Bheed.
              <br />
              Less Waiting.
              <br />
              <span className="text-gradient">More Time.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              BheedLess uses AI-powered crowd intelligence, digital tokens, appointments and
              waiting-time prediction to help people spend less time waiting and organizations
              manage crowds smarter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="hero" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              BheedLess doesn't just manage queues — it predicts them and helps prevent them.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <img
                src={heroImg}
                alt="People waiting in an organized queue at a modern service center"
                width={1600}
                height={1200}
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div className="absolute inset-0 image-tint" />
            </div>

            <div className="absolute -left-2 top-6 w-44 rounded-2xl border border-primary/40 bg-card/90 p-4 backdrop-blur-xl sm:-left-8">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                AI Estimated Wait
              </p>
              <p className="text-3xl font-bold text-primary">18 min</p>
            </div>

            <div className="absolute right-3 top-1/3 w-40 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                People Waiting
              </p>
              <p className="text-3xl font-bold">47</p>
            </div>

            <div className="absolute bottom-20 left-4 w-44 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-xl sm:-left-6">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Crowd Level
              </p>
              <p className="text-xl font-bold text-warning">Moderate</p>
            </div>

            <div className="absolute -bottom-4 right-4 w-44 rounded-2xl border border-primary/50 bg-card/95 p-4 backdrop-blur-xl animate-pulse-glow">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Digital Token
              </p>
              <p className="text-3xl font-bold text-primary">H-127</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="How it works"
          title="Four steps between you and your turn"
          subtitle="Choose → Book/Join → Predict → Get Notified → Arrive → Get Served."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="glass-card rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{s.n}</span>
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTORS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionTitle
          eyebrow="Five sectors"
          title="One platform for every queue in your day"
          subtitle="Live crowd levels and AI wait estimates, updated from structured queue data."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((s) => (
            <SectorCard key={s.id} sector={s} />
          ))}
        </div>
      </section>

      {/* PRIORITY + INTEGRITY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-3xl p-8">
            <Accessibility className="h-7 w-7 text-primary" />
            <h3 className="mt-4 text-2xl font-bold">Priority Lane</h3>
            <p className="mt-3 text-muted-foreground">
              Senior citizens, differently-abled visitors, pregnant women and medical emergencies
              never join the general queue. Walk in, take a priority token and get called next —
              no appointment needed.
            </p>
            <Button variant="neon" className="mt-6" asChild>
              <Link to="/priority">Open Priority Lane</Link>
            </Button>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <ShieldCheck className="h-7 w-7 text-success" />
            <h3 className="mt-4 text-2xl font-bold">Fake-booking protection</h3>
            <p className="mt-3 text-muted-foreground">
              Verified phone numbers, a guardian alert for accounts belonging to minors, a limit on
              simultaneous bookings and no-show strikes keep mischievous bookings out of the queue
              — so real slots stay available for real people.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/about">How we prevent it</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
