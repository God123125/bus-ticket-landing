import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login UI demonstration", {
        description: `Signed in as ${email}`,
      });
    }, 800);
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await apiClient.post("/api/google/auth", tokenResponse);
        console.log("Google auth response:", res.data);
        const token = res.data?.token || res.data?.data?.token;
        if (token) {
          localStorage.setItem("token", token);
        }
        toast.success("Successfully logged in with Google!");
      } catch (error: any) {
        console.error("Failed to connect to Google authentication:", error);
        toast.error(
          error.response?.data?.message || "Failed to authenticate with Google",
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google authentication error:", error);
      toast.error("Google Sign-In was cancelled or failed");
    },
  });

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.warning("Google Client ID not configured", {
        description: "Please add your VITE_GOOGLE_CLIENT_ID to the .env file.",
      });
      return;
    }
    triggerGoogleLogin();
  };

  const handleFillDemo = () => {
    setEmail("passenger@greenbus.travel");
    setPassword("GreenPass#2026");
    toast.success("Demo credentials filled!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl hero-gradient text-primary-foreground shadow-soft">
            <Bus className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            GreenBus
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10 z-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Brand Showcase (Hidden on small screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Seamless Travel Experience</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Your journey begins with a single click.
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Log in to easily manage bookings, download instant e-tickets,
                track live buses, and enjoy exclusive member discounts.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Instant Booking & E-Tickets
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select your favorite seat and get tickets in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    24/7 Trip Management
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reschedule, cancel, or view trip history anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Secure & Verified
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Safe payment gateways & SSL encrypted transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by over 50,000+ happy travelers across the country
            </div>
          </div>

          {/* Right Card / Login Form */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="bg-card border border-border/80 shadow-soft rounded-2xl p-6 sm:p-8 backdrop-blur-xl transition-all">
              <div className="space-y-1.5 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your GreenBus account to continue
                </p>
              </div>

              {/* Google Login Action */}
              <div className="mt-6">
                {/* <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => handleGoogleLogin()}
                  className="w-full flex items-center justify-center gap-2 font-medium border-border/80 hover:bg-secondary/70 hover:border-border h-11 transition-all"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </Button> */}
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const payload = { idToken: credentialResponse.credential };
                    const res = await apiClient.post(
                      "/api/google/auth",
                      payload,
                    );
                    if (res.data?.token) {
                      localStorage.setItem("token", res.data.token);
                      toast.success("Logged in with Google");
                    }
                  }}
                  onError={() => {
                    console.log("Google login failed");
                    toast.error("Google login failed");
                  }}
                />
              </div>

              {/* Divider */}
              {/* <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div> */}

              {/* Form */}
              {/* <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-foreground"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 bg-background/50 border-input focus:bg-background transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold text-foreground"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Password reset instructions", {
                          description:
                            "Password reset link has been simulated.",
                        })
                      }
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 bg-background/50 border-input focus:bg-background transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
                    >
                      Remember for 30 days
                    </Label>
                  </div>

                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-xs text-primary/80 hover:text-primary font-medium underline underline-offset-2"
                  >
                    Fill demo credentials
                  </button>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full h-11 hero-gradient text-primary-foreground font-semibold shadow-soft hover:opacity-95 transition-opacity mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form> */}

              {/* Sign up prompt */}
              {/* <div className="mt-6 text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Registration", {
                      description: "Sign-up page is coming soon!",
                    })
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up for free
                </button>
              </div> */}
            </div>

            {/* Terms and Privacy policy note */}
            <p className="text-center text-xs text-muted-foreground/70 mt-6">
              By continuing, you agree to GreenBus's{" "}
              <a href="#" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-foreground">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimal bar */}
      <footer className="w-full py-4 text-center text-xs text-muted-foreground/60 z-10">
        © {new Date().getFullYear()} GreenBus Inc. All rights reserved.
      </footer>
    </div>
  );
}
