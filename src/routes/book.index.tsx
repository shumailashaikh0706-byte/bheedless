import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { SECTORS } from "@/lib/bheedless/data";
import { predictWait } from "@/lib/bheedless/engine";
import { useApp } from "@/lib/bheedless/store";

export const Route = createFileRoute("/book/")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — BheedLess" },
      {
        name: "description",
        content:
          "Pick a sector and service to reserve a time slot. Your saved profile fills the form automatically.",
      },
      { property: "og:title", content: "Book an Appointment — BheedLess" },
      { property: "og:description", content: "Reserve a slot in seconds across five sectors." },
    ],
  }),
  component: BookIndex,
});

function BookIndex() {
  const { servicesBySector } = useApp();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        title="Book an Appointment"
        subtitle="Choose the service you need — we'll show live availability and predicted waiting time."
      />

      <div className="space-y-12">
        {SECTORS.map((sector) => (
          <section key={sector.id}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sector.icon}</span>
              <div>
                <h2 className="text-xl font-semibold">{sector.name}</h2>
                <p className="text-xs text-muted-foreground">{sector.organization}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servicesBySector(sector.id).map((svc) => {
                const p = predictWait(svc);
                return (
                  <div key={svc.id} className="glass-card rounded-2xl p-5">
                    <h3 className="font-semibold">{svc.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {svc.waiting} in queue · ~{p.minutes} min walk-in wait
                    </p>
                    <Button variant="neon" className="mt-4 w-full" asChild>
                      <Link to="/book/$serviceId" params={{ serviceId: svc.id }}>
                        Book slot
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
