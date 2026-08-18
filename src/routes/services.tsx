import { createFileRoute } from "@tanstack/react-router";
import { SectorCard } from "@/components/bl/sector-card";
import { PageHeader } from "@/components/bl/brand";
import { SECTORS } from "@/lib/bheedless/data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — BheedLess Queue Platform" },
      {
        name: "description",
        content:
          "Hospital, bank, office, college and passport & visa queues with live crowd levels and AI wait estimates.",
      },
      { property: "og:title", content: "BheedLess Services" },
      {
        property: "og:description",
        content: "Five sectors, live crowd levels and AI-predicted waiting times.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        title="Five service sectors"
        subtitle="Live queue data, digital tokens and appointment booking across every sector BheedLess supports."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SECTORS.map((s) => (
          <SectorCard key={s.id} sector={s} />
        ))}
      </div>
    </div>
  );
}
