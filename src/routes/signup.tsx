import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/bl/brand";
import { useApp, type Accessibility as A11y } from "@/lib/bheedless/store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Your BheedLess Account" },
      {
        name: "description",
        content:
          "Save your details once and book appointments or take digital tokens without re-entering anything.",
      },
      { property: "og:title", content: "Create Your BheedLess Account" },
      {
        property: "og:description",
        content: "One profile for appointments, tokens and priority access.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    guardianName: "",
    guardianPhone: "",
  });
  const [accessibility, setAccessibility] = useState<A11y>("none");
  const [agree, setAgree] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const age = form.dateOfBirth
    ? (Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 86400000)
    : null;
  const isMinor = age !== null && age < 18;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      toast.error("Please fill in your name, email, phone and password");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agree) {
      toast.error("Please accept the Terms & Privacy Policy");
      return;
    }
    if (isMinor && (!form.guardianName || !form.guardianPhone)) {
      toast.error("Guardian details are required for users under 18");
      return;
    }
    login({
      id: `u-${Date.now()}`,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      role: "user",
      createdAt: new Date().toISOString(),
      accessibility,
      ...(form.guardianName ? { guardianName: form.guardianName } : {}),
      ...(form.guardianPhone ? { guardianPhone: form.guardianPhone } : {}),
      verified: true,
      noShowStrikes: 0,
    });
    toast.success("Account created", { description: "Your details are saved for future bookings." });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        title="Create Your BheedLess Account"
        subtitle="Save your information once — every appointment afterwards is prefilled."
      />

      <form onSubmit={submit} className="glass-card space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required>
            <Input value={form.fullName} onChange={set("fullName")} placeholder="Ananya Deshmukh" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Phone Number" required>
            <Input value={form.phone} onChange={set("phone")} placeholder="+91 98xxx xxxxx" />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          </Field>
          <Field label="Password" required>
            <Input type="password" value={form.password} onChange={set("password")} />
          </Field>
          <Field label="Confirm Password" required>
            <Input type="password" value={form.confirm} onChange={set("confirm")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Input value={form.address} onChange={set("address")} placeholder="Flat, street, locality" />
            </Field>
          </div>
          <Field label="City">
            <Input value={form.city} onChange={set("city")} placeholder="Pune" />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={set("state")} placeholder="Maharashtra" />
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={set("country")} />
          </Field>
          <Field label="Priority access category">
            <Select value={accessibility} onValueChange={(v) => setAccessibility(v as A11y)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — general queue</SelectItem>
                <SelectItem value="senior">Senior citizen (60+)</SelectItem>
                <SelectItem value="disability">Differently-abled</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {isMinor ? (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
            <p className="text-sm font-semibold text-warning">
              This account belongs to a minor — guardian details are required
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every appointment booked from this account will trigger an instant alert to the
              guardian, and stays pending until the guardian approves it. This prevents fake or
              mischievous bookings.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Guardian name" required>
                <Input value={form.guardianName} onChange={set("guardianName")} />
              </Field>
              <Field label="Guardian phone" required>
                <Input value={form.guardianPhone} onChange={set("guardianPhone")} />
              </Field>
            </div>
          </div>
        ) : null}

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} className="mt-0.5" />
          <span>
            I agree to the Terms & Privacy Policy, and confirm that the details above are genuine.
            Repeated fake bookings or no-shows may restrict my account.
          </span>
        </label>

        <Button type="submit" variant="hero" size="lg" className="w-full">
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
