import { createFileRoute } from "@tanstack/react-router";
import { Bell, BrainCircuit, CalendarCheck, ShieldAlert, Users } from "lucide-react";
import { RequireAuth } from "@/components/bl/require-auth";
import { PageHeader } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp, type Notification } from "@/lib/bheedless/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — BheedLess" },
      {
        name: "description",
        content:
          "Queue alerts, appointment confirmations, AI updates and guardian notifications in one feed.",
      },
      { property: "og:title", content: "Notifications — BheedLess" },
      { property: "og:description", content: "Never miss your turn again." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NotificationsPage />
    </RequireAuth>
  ),
});

const ICONS: Record<Notification["type"], React.ReactNode> = {
  queue: <Users className="h-4 w-4" />,
  appointment: <CalendarCheck className="h-4 w-4" />,
  ai: <BrainCircuit className="h-4 w-4" />,
  alert: <ShieldAlert className="h-4 w-4" />,
  guardian: <Bell className="h-4 w-4" />,
};

function NotificationsPage() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread · queue, appointment and AI alerts`}
        right={
          <Button variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={cn(
              "flex w-full gap-4 rounded-2xl border p-5 text-left transition-colors",
              n.read
                ? "border-border bg-card/40"
                : "border-primary/40 bg-primary/10 hover:bg-primary/15",
            )}
          >
            <span className="mt-1 text-primary">{ICONS[n.type]}</span>
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{n.title}</span>
                {!n.read ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    NEW
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{n.message}</span>
              <span className="mt-2 block text-[11px] text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
