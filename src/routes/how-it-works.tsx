import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing,
  BrainCircuit,
  CalendarCheck,
  QrCode,
  Users,
  LineChart,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionTitle } from "@/components/bl/brand";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How BheedLess Works — From Token to Turn" },
      {
        name: "description",
        content:
          "Choose a service, book or join, get an AI-predicted wait, and arrive exactly when your turn approaches.",
      },
      { property: "og:title", content: "How BheedLess Works" },
      {
        property: "og:description",
        content: "Four steps from choosing a service to being served, powered by queue analytics.",
      },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    n: "01",
    title: "Choose a Service",
    body: "Select a hospital, bank, office, college, or passport/visa service near you.",
    icon: QrCode,
  },
  {
    n: "02",
    title: "Book or Join",
    body: "Book an appointment for later, or take a digital token to join the live queue right now.",
    icon: CalendarCheck,
  },
  {
    n: "03",
    title: "Know Your Wait",
    body: "BheedLess AI predicts your waiting time from people ahead, active counters, service speed and historical demand.",
    icon: BrainCircuit,
  },
  {
    n: "04",
    title: "Arrive at the Right Time",
    body: "Receive notifications as your turn approaches and walk in without standing in line.",
    icon: BellRing,
  },
];

const orgs = [
  { icon: Users, title: "Monitor crowds live", body: "Every sector, service and counter in one operations view." },
  { icon: Gauge, title: "Predict surges", body: "Forecast crowd build-up hours before it happens." },
  { icon: LineChart, title: "Act on recommendations", body: "AI suggests counter activation with projected impact." },
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        title="How BheedLess works"
        subtitle="A queue you never have to physically stand in."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">{s.n}</span>
              <s.icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <SectionTitle
          eyebrow="For organizations"
          title="Crowd management that works before the crowd arrives"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {orgs.map((o) => (
            <div key={o.title} className="glass-card rounded-3xl p-6">
              <o.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{o.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{o.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-brand p-10 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground">Ready to skip the queue?</h2>
        <Button size="lg" variant="secondary" className="mt-6" asChild>
          <Link to="/signup">Create your free account</Link>
        </Button>
      </div>
    </div>
  );
}
