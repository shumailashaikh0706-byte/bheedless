import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useApp, type Role } from "@/lib/bheedless/store";

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, hydrated } = useApp();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">
        Loading your BheedLess workspace…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in — or use a demo account — to access tokens, appointments and dashboards.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="hero" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Restricted area</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This console requires a {roles.join(" or ")} account. Sign in with a demo{" "}
          {roles[0]} account to explore it.
        </p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/login">Switch account</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
