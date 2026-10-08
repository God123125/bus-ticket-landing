import { Link, useNavigate } from "@tanstack/react-router";
import { Bus, LogOut, Menu, User as UserIcon, X, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageChanger } from "@/components/language-changer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuthSession, getValidAuthSession, type UserAuthData } from "@/lib/auth";
import { toast } from "sonner";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [auth, setAuth] = useState<UserAuthData>(() => getValidAuthSession());

  useEffect(() => {
    // Check token validity on mount & listen to window focus / storage changes
    const syncAuth = () => {
      const current = getValidAuthSession();
      setAuth(current);
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);

    // Periodic check every 15 seconds to ensure expired tokens are purged automatically
    const interval = setInterval(() => {
      syncAuth();
    }, 15000);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setAuth({
      token: null,
      name: null,
      email: null,
      profile: null,
      isAuthenticated: false,
    });
    toast.success("Successfully logged out");
    navigate({ to: "/" });
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/booking", label: t("nav.myBookings") },
  ];

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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

          {auth.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 rounded-full p-1 pl-2 hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="User profile menu"
                >
                  <Avatar className="h-8 w-8 border border-border/80 shadow-xs">
                    {auth.profile ? (
                      <AvatarImage src={auth.profile} alt={auth.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(auth.name, auth.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {auth.name || auth.email?.split("@")[0] || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {auth.name || "Signed in"}
                    </p>
                    {auth.email && (
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {auth.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/booking" className="cursor-pointer flex items-center">
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>{t("nav.myBookings")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageChanger />
          {auth.isAuthenticated && (
            <Avatar className="h-8 w-8 border border-border">
              {auth.profile ? (
                <AvatarImage src={auth.profile} alt={auth.name || "User"} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(auth.name, auth.email)}
              </AvatarFallback>
            </Avatar>
          )}
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
            {auth.isAuthenticated && (
              <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg mb-2">
                <Avatar className="h-9 w-9 border border-border">
                  {auth.profile ? (
                    <AvatarImage src={auth.profile} alt={auth.name || "User"} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(auth.name, auth.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {auth.name || "User"}
                  </p>
                  {auth.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {auth.email}
                    </p>
                  )}
                </div>
              </div>
            )}

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
              {auth.isAuthenticated ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </Button>
              ) : (
                <Button size="sm" className="w-full" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
