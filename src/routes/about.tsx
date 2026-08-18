import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Accessibility, Clock, Fingerprint } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/bl/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BheedLess — Predicting Queues, Not Just Managing Them" },
      {
        name: "description",
        content:
          "Why BheedLess exists, how the waiting-time engine works, and the safeguards that keep queues fair for everyone.",
      },
      { property: "og:title", content: "About BheedLess" },
      {
        property: "og:description",
        content: "Crowd intelligence, priority access and fake-booking protection explained.",
      },
    ],
  }),
  component: About,
});

const safeguards = [
  {
    icon: Fingerprint,
    title: "Verified identity",
    body: "Every account is tied to a verified phone number and email. One person cannot flood a queue from ten fake profiles.",
  },
  {
    icon: ShieldCheck,
    title: "Guardian alert for minors",
    body: "If the date of birth on an account is under 18, every booking is held as pending and an instant alert goes to the registered guardian's phone and email. The guardian can approve or reject the appointment.",
  },
  {
    icon: Clock,
    title: "Booking limits & no-show strikes",
    body: "A maximum of 4 upcoming appointments per account, one active token per service, and three no-shows temporarily restrict booking. Cancelling is only possible more than 10 minutes before the slot, so freed slots can be reused.",
  },
  {
    icon: Accessibility,
    title: "Priority lane, not queue-jumping",
    body: "Senior citizens and differently-abled visitors use a separate served-next lane, verified at the counter, so priority access can't be abused.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHeader
        title="BheedLess doesn't just manage queues. It predicts them."
        subtitle="Bheed means crowd. We built BheedLess so that showing up for healthcare, banking, education or documents no longer means losing half a day."
      />

      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-xl font-semibold">The waiting-time engine</h2>
        <p className="mt-3 text-muted-foreground">
          Numbers you see are never invented by a language model. Every estimate is calculated from
          structured queue data:
        </p>
        <p className="mt-5 rounded-2xl bg-secondary p-5 text-center font-mono text-sm text-primary">
          Estimated Wait = People Ahead × Average Service Time ÷ Active Counters
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          That baseline is then adjusted for current crowd level, counter utilisation, service type
          and time of day. The AI layer explains the result and recommends actions — it does not
          guess the number.
        </p>
      </div>

      <div className="mt-16">
        <SectionTitle
          eyebrow="Fairness"
          title="Stopping fake and mischievous bookings"
          subtitle="A queue only works if the people in it are real."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {safeguards.map((s) => (
            <div key={s.title} className="glass-card rounded-3xl p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
