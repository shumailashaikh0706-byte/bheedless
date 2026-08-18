import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, LogOut, LayoutDashboard, User as UserIcon, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/bheedless/store";
import { Logo } from "./brand";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/priority", label: "Priority Lane" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const { user, unreadCount, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = user
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="text-xl">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() => navigate({ to: "/notifications" })}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none ring-primary/50 focus-visible:ring-2">
                    <Avatar className="h-9 w-9 border border-primary/40">
                      <AvatarFallback className="bg-secondary text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role} account</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                    <UserIcon className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/appointments" })}>
                    <Bell className="mr-2 h-4 w-4" /> My Appointments
                  </DropdownMenuItem>
                  {user.role !== "user" ? (
                    <DropdownMenuItem
                      onClick={() =>
                        navigate({ to: user.role === "admin" ? "/admin" : "/staff" })
                      }
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {user.role === "admin" ? "Operations Center" : "Staff Console"}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" onClick={() => navigate({ to: "/login" })}>
                Login
              </Button>
              <Button variant="hero" onClick={() => navigate({ to: "/signup" })}>
                Get Started
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-surface">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {user ? (
                    <Button variant="hero" onClick={() => { setOpen(false); navigate({ to: "/dashboard" }); }}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => { setOpen(false); navigate({ to: "/login" }); }}>
                        Login
                      </Button>
                      <Button variant="hero" onClick={() => { setOpen(false); navigate({ to: "/signup" }); }}>
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo className="text-xl" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Less Bheed. Less Waiting. More Time. AI-powered queue and crowd intelligence for
            hospitals, banks, offices, colleges and passport centers.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Platform</p>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <Link to="/services">Services</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/priority">Priority Lane</Link>
            <Link to="/about">About</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Get started</p>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <Link to="/login">Login</Link>
            <Link to="/signup">Create account</Link>
            <Link to="/admin">Operations Center</Link>
          </div>
        </div>
      </div>
      <p className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © 2026 BheedLess · Demo data shown for illustration
      </p>
    </footer>
  );
}
