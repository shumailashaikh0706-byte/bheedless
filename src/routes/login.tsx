import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import authImg from "@/assets/auth.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/bl/brand";
import { DEMO_ADMIN, DEMO_STAFF, DEMO_USER, useApp, type Profile } from "@/lib/bheedless/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — BheedLess" },
      {
        name: "description",
        content: "Sign in to BheedLess to track your digital tokens, appointments and queue position.",
      },
      { property: "og:title", content: "Login to BheedLess" },
      { property: "og:description", content: "Access your tokens, appointments and live queue." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const enter = (profile: Profile) => {
    login(profile);
    toast.success(`Welcome back, ${profile.fullName.split(" ")[0]}!`);
    navigate({ to: profile.role === "admin" ? "/admin" : profile.role === "staff" ? "/staff" : "/dashboard" });
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={authImg}
          alt="A person booking a service appointment on a smartphone"
          width={1024}
          height={1400}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 image-tint" />
        <div className="absolute bottom-16 left-12 right-12">
          <Logo className="text-4xl" />
          <p className="mt-3 text-lg text-muted-foreground">
            Less Bheed. Less Waiting. More Time.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your BheedLess account.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email || !password) {
                toast.error("Enter your email and password");
                return;
              }
              enter({ ...DEMO_USER, email, fullName: DEMO_USER.fullName });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox id="remember" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => toast.info("A reset link would be sent to your email.")}
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create Account
            </Link>
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Hackathon demo access
            </p>
            <div className="mt-3 grid gap-2">
              <Button variant="neon" onClick={() => enter(DEMO_USER)}>
                Demo User
              </Button>
              <Button variant="outline" onClick={() => enter(DEMO_STAFF)}>
                Demo Staff
              </Button>
              <Button variant="outline" onClick={() => enter(DEMO_ADMIN)}>
                Demo Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
