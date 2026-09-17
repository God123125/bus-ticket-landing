import { Link } from "@tanstack/react-router";
import { Bus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  // { to: "/search", label: "Routes" },
  { to: "/booking", label: "My Bookings" },
  // { to: "http://localhost:4200", label: "Admin Portal", external: true },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl hero-gradient text-primary-foreground shadow-soft">
            <Bus className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">GreenBus</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            // l.external ? (
            //   <a
            //     key={l.to}
            //     href={l.to}
            //     target="_blank"
            //     rel="noreferrer"
            //     className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            //   >
            //     {l.label}
            //   </a>
            // ) : (
            <Link
              key={l.to}
              to={l.to as any}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{
                className:
                  "rounded-md px-3 py-2 text-sm font-medium text-primary bg-secondary",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          {/* <Button size="sm">Register</Button> */}
        </div>
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {links.map((l) => (
              // l.external ? (
              //   <a
              //     key={l.to}
              //     href={l.to}
              //     target="_blank"
              //     rel="noreferrer"
              //     onClick={() => setOpen(false)}
              //     className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              //   >
              //     {l.label}
              //   </a>
              // ) : (
              <Link
                key={l.to}
                to={l.to as any}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
              {/* <Button size="sm" className="flex-1">
                Register
              </Button> */}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
