import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/bl/require-auth";
import { PageHeader } from "@/components/bl/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, type Accessibility } from "@/lib/bheedless/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — BheedLess" },
      {
        name: "description",
        content:
          "Manage your saved details, priority access category and guardian contact for faster bookings.",
      },
      { property: "og:title", content: "My Profile — BheedLess" },
      { property: "og:description", content: "Saved once, reused on every booking." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user, updateProfile, logout, resetDemo, tokens, appointments } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    country: user?.country ?? "",
    guardianName: user?.guardianName ?? "",
    guardianPhone: user?.guardianPhone ?? "",
  });
  const [accessibility, setAccessibility] = useState<Accessibility>(user?.accessibility ?? "none");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHeader
        title="My Profile"
        subtitle="These details are reused automatically every time you book."
        right={
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDemo}>
              Reset demo data
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                toast.success("Signed out");
                navigate({ to: "/" });
              }}
            >
              Log out
            </Button>
          </div>
        }
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Badge variant="secondary">{tokens.length} tokens taken</Badge>
        <Badge variant="secondary">{appointments.length} appointments</Badge>
        <Badge variant="outline">
          {user?.verified ? "Verified account" : "Verification pending"}
        </Badge>
        <Badge variant="outline">No-show strikes: {user?.noShowStrikes ?? 0}</Badge>
      </div>

      <form
        className="glass-card space-y-6 rounded-3xl p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile({ ...form, accessibility });
          toast.success("Profile updated");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Full name">
            <Input value={form.fullName} onChange={set("fullName")} />
          </F>
          <F label="Email">
            <Input type="email" value={form.email} onChange={set("email")} />
          </F>
          <F label="Phone">
            <Input value={form.phone} onChange={set("phone")} />
          </F>
          <F label="Date of birth">
            <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          </F>
          <div className="sm:col-span-2">
            <F label="Address">
              <Input value={form.address} onChange={set("address")} />
            </F>
          </div>
          <F label="City">
            <Input value={form.city} onChange={set("city")} />
          </F>
          <F label="State">
            <Input value={form.state} onChange={set("state")} />
          </F>
          <F label="Country">
            <Input value={form.country} onChange={set("country")} />
          </F>
          <F label="Priority access category">
            <Select value={accessibility} onValueChange={(v) => setAccessibility(v as Accessibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — general queue</SelectItem>
                <SelectItem value="senior">Senior citizen (60+)</SelectItem>
                <SelectItem value="disability">Differently-abled</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Guardian name (if under 18)">
            <Input value={form.guardianName} onChange={set("guardianName")} />
          </F>
          <F label="Guardian phone">
            <Input value={form.guardianPhone} onChange={set("guardianPhone")} />
          </F>
        </div>

        <Button type="submit" variant="hero" size="lg">
          Save changes
        </Button>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
