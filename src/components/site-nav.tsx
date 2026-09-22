import { Link } from "@tanstack/react-router";
import { Bus, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageChanger } from "@/components/language-changer";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/booking", label: t("nav.myBookings") },
  ];

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
        <div className="hidden items-center gap-3 md:flex">
          <LanguageChanger />
          <Button size="sm" asChild>
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageChanger />
          <button
            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50">
              <Button size="sm" className="w-full" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>
                  {t("nav.login")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
