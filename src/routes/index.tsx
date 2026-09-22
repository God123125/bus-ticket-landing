import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";
import { apiClient } from "@/api/client";
import {
  ArrowRight,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Search,
  Shield,
  Star,
  Ticket,
  Wallet,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Compass,
  ArrowUpDown,
  Zap,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CITIES, type Geographic } from "@/lib/booking-data";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import busImg from "@/assets/bus.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

export interface IScheduleLandingItem {
  _id: string;
  from: Geographic;
  to: Geographic;
  departure_time: string;
  arrival_time: string;
  departure_station?: { _id: string; station_name: string } | string;
  arrival_station?: { _id: string; station_name: string } | string;
  company?: { _id: string; name: string; image?: string } | string;
  description?: string;
  image?: string;
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #064e3b, #059669)",
  "linear-gradient(135deg, #0f766e, #0d9488)",
  "linear-gradient(135deg, #14532d, #16a34a)",
  "linear-gradient(135deg, #047857, #10b981)",
];

const fallbackSchedules = [
  {
    _id: "s-1",
    from: { _id: "pp", name_kh: "ភ្នំពេញ", name_en: "Phnom Penh" },
    to: { _id: "sr", name_kh: "សៀមរាប", name_en: "Siem Reap" },
    departure_time: "07:30 AM",
    arrival_time: "01:30 PM",
    departure_station: { _id: "st1", station_name: "Central Terminal" },
    arrival_station: { _id: "st2", station_name: "Heritage Station" },
    company: { _id: "c1", name: "Larryta Express" },
  },
  {
    _id: "s-2",
    from: { _id: "pp", name_kh: "ភ្នំពេញ", name_en: "Phnom Penh" },
    to: { _id: "shv", name_kh: "ព្រះសីហនុ", name_en: "Sihanoukville" },
    departure_time: "08:30 AM",
    arrival_time: "11:30 AM",
    departure_station: { _id: "st1", station_name: "Express Highway Hub" },
    arrival_station: { _id: "st3", station_name: "Ochheuteal Pier" },
    company: { _id: "c2", name: "Vireak Buntham" },
  },
  {
    _id: "s-3",
    from: { _id: "pp", name_kh: "ភ្នំពេញ", name_en: "Phnom Penh" },
    to: { _id: "btb", name_kh: "បាត់ដំបង", name_en: "Battambang" },
    departure_time: "09:00 AM",
    arrival_time: "02:30 PM",
    departure_station: { _id: "st1", station_name: "Riverside Depot" },
    arrival_station: { _id: "st4", station_name: "City Center Station" },
    company: { _id: "c3", name: "Giant Ibis" },
  },
  {
    _id: "s-4",
    from: { _id: "pp", name_kh: "ភ្នំពេញ", name_en: "Phnom Penh" },
    to: { _id: "kp", name_kh: "កំពត", name_en: "Kampot" },
    departure_time: "01:00 PM",
    arrival_time: "04:30 PM",
    departure_station: { _id: "st1", station_name: "Central Terminal" },
    arrival_station: { _id: "st5", station_name: "Durian Roundabout" },
    company: { _id: "c4", name: "Mey Hong Bus" },
  },
];

function Index() {
  const { t, i18n } = useTranslation();
  const isKhmer = i18n.language?.startsWith("km");
  const nav = useNavigate({ from: Route.fullPath });
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState("Phnom Penh");
  const [to, setTo] = useState("Siem Reap");
  const [date, setDate] = useState(today);

  const [schedules, setSchedules] = useState<IScheduleLandingItem[]>([]);
  const [rawGeos, setRawGeos] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const features = [
    {
      icon: Shield,
      title: t("whyChoose.safeTitle"),
      desc: t("whyChoose.safeDesc"),
      badge: t("whyChoose.safeBadge"),
    },
    {
      icon: Wallet,
      title: t("whyChoose.priceTitle"),
      desc: t("whyChoose.priceDesc"),
      badge: t("whyChoose.priceBadge"),
    },
    {
      icon: Zap,
      title: t("whyChoose.instantTitle"),
      desc: t("whyChoose.instantDesc"),
      badge: t("whyChoose.instantBadge"),
    },
    {
      icon: Clock,
      title: t("whyChoose.supportTitle"),
      desc: t("whyChoose.supportDesc"),
      badge: t("whyChoose.supportBadge"),
    },
  ];

  const stats = [
    { value: "500K+", label: t("stats.happyTravelers"), icon: Users },
    { value: "120+", label: t("stats.dailyDepartures"), icon: TrendingUp },
    { value: "25+", label: t("stats.provincialRoutes"), icon: Compass },
    { value: "99.8%", label: t("stats.onTimeRate"), icon: Award },
  ];

  const reviews = [
    {
      name: t("reviews.r1.name"),
      role: t("reviews.r1.role"),
      text: t("reviews.r1.text"),
      rating: 5,
      city: t("reviews.r1.city"),
    },
    {
      name: t("reviews.r2.name"),
      role: t("reviews.r2.role"),
      text: t("reviews.r2.text"),
      rating: 5,
      city: t("reviews.r2.city"),
    },
    {
      name: t("reviews.r3.name"),
      role: t("reviews.r3.role"),
      text: t("reviews.r3.text"),
      rating: 5,
      city: t("reviews.r3.city"),
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    setLoadingCities(true);
    apiClient
      .get("/api/geographics", { params: { limit: 100 } })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.list)
            ? res.data.list
            : [];
        if (list.length > 0) {
          setRawGeos(list);
          const mapped = list.map((g: any) => ({
            label: isKhmer
              ? g.name_kh
                ? `${g.name_kh} (${g.name_en || ""})`
                : g.name_en
              : g.name_en
                ? `${g.name_en} (${g.name_kh || ""})`
                : g.name_kh,
            value: g._id,
          }));
          setFrom((prev) =>
            mapped.some((c: any) => c.value === prev) ? prev : mapped[0].value,
          );
          setTo((prev) =>
            mapped.length > 1
              ? mapped.some(
                  (c: any) => c.value === prev && c.value !== mapped[0].value,
                )
                ? prev
                : mapped[1].value
              : prev,
          );
        } else {
          setRawGeos([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load geographics:", err);
        setRawGeos([]);
      })
      .finally(() => {
        setLoadingCities(false);
      });
  }, [isKhmer]);

  useEffect(() => {
    apiClient
      .get("/api/schedules/landing-schedule")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSchedules(res.data);
        } else {
          setSchedules(fallbackSchedules as any);
        }
        setTimeout(() => AOS.refresh(), 100);
      })
      .catch((err) => {
        console.error("Failed to load landing schedules:", err);
        setSchedules(fallbackSchedules as any);
        setTimeout(() => AOS.refresh(), 100);
      });
  }, []);

  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [returnDate, setReturnDate] = useState("");

  const cityOptions =
    rawGeos.length > 0
      ? rawGeos.map((g: any) => ({
          label: isKhmer
            ? g.name_kh
              ? `${g.name_kh} (${g.name_en || ""})`
              : g.name_en
            : g.name_en
              ? `${g.name_en} (${g.name_kh || ""})`
              : g.name_kh,
          value: g._id,
        }))
      : CITIES.map((c) => ({ label: c, value: c }));

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const displaySchedules =
    schedules.length > 0 ? schedules : (fallbackSchedules as any);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative min-h-[620px] flex items-center justify-center overflow-hidden py-16 md:py-24">
        {/* Background visual layers */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={busImg}
            alt="Scenic travel background"
            className="h-full w-full object-cover scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Multi-tone modern gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-emerald-950/75 to-slate-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,78,59,0.35),transparent_60%)]" />
        </div>

        {/* Floating animated decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl animate-pulse-subtle" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl animate-float" />

        <div className="relative mx-auto max-w-7xl px-4 w-full">
          <div className="mx-auto max-w-3xl text-center text-white">
            {/* Top pill badge */}
            <div
              data-aos="fade-down"
              data-aos-duration="600"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40 animate-float"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="800"
              className="mt-6 text-4xl font-black tracking-tight leading-tight sm:leading-snug md:leading-normal text-white sm:text-5xl md:text-6xl lg:text-5xl"
            >
              {t("hero.titlePrefix")} <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
                {t("hero.titleHighlight")}
              </span>
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="800"
              className="mt-5 text-base sm:text-lg text-emerald-50/85 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {t("hero.description")}
            </p>
          </div>

          {/* Search card */}
          <div
            data-aos="zoom-in-up"
            data-aos-delay="300"
            data-aos-duration="800"
            className="mt-10 mx-auto max-w-5xl"
          >
            <Card className="glass-panel border border-white/20 p-5 sm:p-7 shadow-2xl rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

              {/* Trip Type Selector */}
              <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center p-1 rounded-xl bg-muted/80 border border-border/40 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      setTripType("oneway");
                      setReturnDate("");
                    }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      tripType === "oneway"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("hero.oneWay")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTripType("roundtrip");
                      if (!returnDate) setReturnDate(date);
                    }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      tripType === "roundtrip"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("hero.roundTrip")}
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{t("hero.instantPassBadge")}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div
                className={`grid gap-4 ${
                  tripType === "roundtrip"
                    ? "grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]"
                    : "grid-cols-1 md:grid-cols-[1fr_auto_1fr_1.2fr_auto]"
                } items-end`}
              >
                {/* From Location */}
                <SelectField
                  icon={
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  }
                  label={t("hero.departureCity")}
                  value={from}
                  onChange={setFrom}
                  options={cityOptions}
                  disabled={loadingCities}
                />

                {/* Swap Button */}
                <div className="hidden md:flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={swapLocations}
                    aria-label="Swap origin and destination"
                    className="h-10 w-10 rounded-full border border-border/80 bg-background/90 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-accent flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
                  >
                    <ArrowUpDown className="h-4 w-4 md:rotate-90" />
                  </button>
                </div>

                {/* To Location */}
                <SelectField
                  icon={
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  }
                  label={t("hero.destinationCity")}
                  value={to}
                  onChange={setTo}
                  options={cityOptions.filter(
                    (c) => (typeof c === "string" ? c : c.value) !== from,
                  )}
                  disabled={loadingCities}
                />

                {/* Departure Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("hero.departureDate")}
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (returnDate && e.target.value > returnDate) {
                          setReturnDate(e.target.value);
                        }
                      }}
                      className="h-11 pl-10 rounded-xl font-medium text-sm bg-background/80 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Return Date (if Round-trip) */}
                {tripType === "roundtrip" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("hero.returnDate")}
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="h-11 pl-10 rounded-xl font-medium text-sm bg-background/80 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Search Button */}
                <div className="w-full">
                  <Button
                    size="lg"
                    className="h-11 w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    onClick={() =>
                      nav({
                        to: "/search",
                        search: {
                          from,
                          to,
                          date,
                          returnDate:
                            tripType === "roundtrip" ? returnDate : undefined,
                          tripType,
                        },
                      })
                    }
                  >
                    <Search className="h-4 w-4 stroke-[2.5]" />
                    <span>{t("hero.searchBuses")}</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-8 mx-auto max-w-6xl px-4">
        <div
          data-aos="fade-up"
          data-aos-offset="50"
          className="rounded-2xl border border-border/50 bg-card/95 p-6 shadow-xl backdrop-blur-lg grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60"
        >
          {stats.map((st, i) => (
            <div
              key={st.label}
              data-aos="zoom-in"
              data-aos-delay={i * 100}
              className={`flex items-center gap-4 ${
                i !== 0 ? "pt-4 md:pt-0 md:pl-6" : ""
              }`}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-primary border border-emerald-500/20">
                <st.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {st.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {st.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Offer Banner */}
      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div
          data-aos="fade-up"
          data-aos-duration="800"
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 md:p-8 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                <Sparkles className="h-3 w-3" /> {t("promo.badge")}
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {t("promo.title")}
              </h3>
              <p className="text-sm md:text-base text-emerald-100/80 max-w-xl">
                {t("promo.description")}{" "}
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                  {t("promo.code")}
                </span>{" "}
                {t("promo.suffix")}
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="rounded-xl font-semibold bg-white text-emerald-950 hover:bg-emerald-50 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
              onClick={() => {
                nav({
                  to: "/search",
                  search: {
                    from,
                    to,
                    date,
                  },
                });
              }}
            >
              {t("promo.bookNightBus")}{" "}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Schedules Section (DISPLAY ONLY - Non-clickable / No routing) */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div
          data-aos="fade-up"
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Calendar className="h-3.5 w-3.5" /> {t("schedules.timetable")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t("schedules.title")}
            </h2>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t("schedules.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displaySchedules.map((s: IScheduleLandingItem, idx: number) => {
            const depStationName =
              typeof s.departure_station === "object"
                ? s.departure_station?.station_name
                : "";
            const arrStationName =
              typeof s.arrival_station === "object"
                ? s.arrival_station?.station_name
                : "";
            const companyName =
              typeof s.company === "object" ? s.company?.name : "";
            const companyImage =
              typeof s.company === "object" ? s.company?.image : undefined;

            const headerImage = s.image || companyImage;
            const cardHeaderStyle = headerImage
              ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(5, 46, 22, 0.4), rgba(5, 46, 22, 0.85)), url(${headerImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length],
                };

            const fromName = isKhmer
              ? s.from?.name_kh || s.from?.name_en || "ចេញដំណើរ"
              : s.from?.name_en
                ? `${s.from.name_en} (${s.from.name_kh || ""})`
                : s.from?.name_kh || "Departure";
            const toName = isKhmer
              ? s.to?.name_kh || s.to?.name_en || "គោលដៅ"
              : s.to?.name_en
                ? `${s.to.name_en} (${s.to.name_kh || ""})`
                : s.to?.name_kh || "Destination";

            return (
              <div
                key={s._id || idx}
                data-aos="fade-up"
                data-aos-delay={(idx % 4) * 100}
                data-aos-duration="700"
                className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between select-none"
              >
                {/* Visual Top Header */}
                <div
                  className="h-40 p-4 flex flex-col justify-between text-white relative transition-transform duration-500 group-hover:scale-[1.02]"
                  style={cardHeaderStyle}
                >
                  <div className="flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center text-xs font-semibold uppercase tracking-wider bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white/95 border border-white/15 shadow-sm">
                      <Clock className="mr-1.5 h-3.5 w-3.5 text-emerald-300 inline" />
                      {s.departure_time} - {s.arrival_time}
                    </div>
                    {companyName && (
                      <span className="text-xs font-semibold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white/95 border border-white/15 truncate max-w-[120px]">
                        {companyName}
                      </span>
                    )}
                  </div>

                  <div className="z-10 mt-auto">
                    {depStationName && (
                      <p className="text-xs font-light text-emerald-100/90 truncate drop-shadow flex items-center gap-1">
                        <MapPin className="h-3 w-3 inline text-emerald-300" />
                        {depStationName}
                      </p>
                    )}
                    <p className="text-base font-bold drop-shadow leading-snug mt-0.5">
                      {fromName} → {toName}
                    </p>
                  </div>
                </div>

                {/* Card Body - Display details without any routing */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-card">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {t("schedules.type")}
                      </span>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 font-semibold text-[11px]">
                        {t("schedules.dailyFixed")}
                      </span>
                    </div>

                    {arrStationName && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("schedules.arrivalTerminal")}</span>
                        <span className="font-medium text-foreground/80 truncate max-w-[140px]">
                          {arrStationName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informative footer state (Display only, non-clickable) */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                      <Bus className="h-3.5 w-3.5 text-primary" />{" "}
                      {t("schedules.acExpress")}
                    </span>
                    <span className="font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md">
                      {t("schedules.regularTrip")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose GreenBus */}
      <section className="bg-gradient-to-b from-secondary/30 via-secondary/60 to-secondary/30 py-20 border-y border-border/40 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4">
          <div data-aos="fade-up">
            <SectionHeader
              title={t("whyChoose.title")}
              subtitle={t("whyChoose.subtitle")}
            />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <Card
                key={f.title}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                data-aos-duration="700"
                className="group relative p-6 card-hover border-border/70 bg-card rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                    {f.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 overflow-hidden">
        <div data-aos="fade-up">
          <SectionHeader
            title={t("reviews.title")}
            subtitle={t("reviews.subtitle")}
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, idx) => (
            <Card
              key={r.name}
              data-aos="zoom-in-up"
              data-aos-delay={idx * 150}
              data-aos-duration="700"
              className="p-6 card-hover border-border/70 bg-card rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {t("reviews.verifiedRider")}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-foreground/90 italic leading-relaxed">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                  {r.city}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="mx-auto max-w-7xl px-4 pb-16 overflow-hidden">
        <div
          data-aos="zoom-in"
          data-aos-duration="800"
          className="rounded-3xl border border-primary/20 bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-900 p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              {t("cta.title")}
            </h2>
            <p className="text-emerald-100/80 text-sm md:text-base">
              {t("cta.description")}
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Move to Top Floating Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Move to top"
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 border border-primary-glow/40 backdrop-blur transition-all duration-300 hover:bg-primary/90 hover:scale-110 active:scale-95 group ${
          showScrollTop
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <ChevronUp className="h-6 w-6 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>

      <SiteFooter />
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <p className="mt-2.5 text-sm sm:text-base text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

function SelectField({
  icon,
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { label: string; value: string })[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {options.map((o) => {
            const val = typeof o === "string" ? o : o.value;
            const lbl = typeof o === "string" ? o : o.label;
            return (
              <option
                key={val}
                value={val}
                className="bg-background text-foreground py-1"
              >
                {lbl}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
