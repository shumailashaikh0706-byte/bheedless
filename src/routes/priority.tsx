import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, HeartPulse, ShieldCheck, UserRoundCheck } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/priority")({
  head: () => ({
    meta: [
      { title: "Priority Access — BheedLess" },
      {
        name: "description",
        content:
          "Senior citizens, differently-abled visitors and emergency cases get a dedicated priority lane on BheedLess.",
      },
      { property: "og:title", content: "Priority Access — BheedLess" },
      {
        property: "og:description",
        content: "A fair, transparent priority lane for those who need it most.",
      },
    ],
  }),
  component: PriorityPage,
});

const GROUPS = [
  {
    icon: UserRoundCheck,
    title: "Senior citizens (60+)",
    body: "Automatically placed in the priority lane and called ahead of the general queue, with a seat-time estimate sent to their phone.",
  },
  {
    icon: Accessibility,
    title: "Differently-abled visitors",
    body: "Priority tokens plus counter-level assistance requests, so no one has to stand in a long physical line.",
  },
  {
    icon: HeartPulse,
    title: "Medical emergencies",
    body: "Emergency registration bypasses the queue entirely; staff can issue an override token from the counter console.",
  },
  {
    icon: ShieldCheck,
    title: "Guardian-verified minors",
    body: "Accounts belonging to users under 18 require guardian approval, protecting both the visitor and the institution.",
  },
];

function PriorityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHeader
        title="Priority Access"
        subtitle="Fairness is not the same as first-come-first-served. BheedLess builds compassion into the queue."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="glass-card rounded-3xl p-6">
            <g.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">{g.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <SectionTitle
          eyebrow="How it stays fair"
          title="Priority without unfairness"
          subtitle="Priority tokens are capped so the general queue keeps moving."
        />
        <ol className="mt-8 space-y-4">
          {[
            "A priority token is inserted at most two positions ahead of the counter — never at the very front of a mid-service customer.",
            "At most one in every three called tokens can come from the priority lane, so general waiting times stay predictable.",
            "Priority status is set on your profile and verified at the counter with your QR pass.",
            "Misuse is detected through repeated no-shows, and the account loses priority until it is re-verified.",
          ].map((t, i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-border bg-card/40 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{t}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 rounded-3xl border border-primary/30 bg-primary/10 p-8 text-center">
        <h2 className="text-2xl font-bold">Need priority access?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Set your category once on your profile — every token and appointment afterwards is issued
          in the priority lane automatically.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="hero" asChild>
            <Link to="/profile">Update my profile</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/services">Browse services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
