import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowLeftRight,
  ArrowRight,
  Bus,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  searchTrips,
  saveDraft,
  loadDraft,
  type BusType,
  type Trip,
  type Geographic,
} from "@/lib/booking-data";
import { apiClient } from "@/api/client";
import { getJSON } from "@/api/request.service";
import { toast } from "sonner";

const geographicSchema = z.object({
  _id: z.string().optional(),
  name_kh: z.string().optional(),
  name_en: z.string().optional(),
});

const searchSchema = z.object({
  from: z.union([z.string(), geographicSchema]).optional(),
  to: z.union([z.string(), geographicSchema]).optional(),
  date: z.string().optional(),
  returnDate: z.string().optional(),
  tripType: z.enum(["oneway", "roundtrip"]).optional(),
  schedule: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchPage,
});

const TIME_BUCKETS = [
  {
    key: "morning",
    label: "Morning (6-12)",
    test: (h: number) => h >= 6 && h < 12,
  },
  {
    key: "afternoon",
    label: "Afternoon (12-18)",
    test: (h: number) => h >= 12 && h < 18,
  },
  { key: "evening", label: "Evening (18-24)", test: (h: number) => h >= 18 },
  { key: "night", label: "Night (0-6)", test: (h: number) => h < 6 },
];

const BUS_TYPES: BusType[] = ["VIP 2-2", "VIP 2-1", "Sleeper"];
const AMENITIES = ["WiFi", "AC", "Water", "USB", "Blanket", "Snack"];

function normalizeGeo(
  geo: any,
  fallback?: string | Geographic,
  defaultEn = "Phnom Penh",
  defaultKh = "ភ្នំពេញ",
): Geographic {
  if (
    geo &&
    typeof geo === "object" &&
    (geo.name_kh || geo.name_en || geo._id)
  ) {
    return {
      _id: geo._id,
      name_kh: geo.name_kh || geo.name_en || defaultKh,
      name_en: geo.name_en || geo.name_kh || defaultEn,
    };
  }
  if (fallback && typeof fallback === "object") {
    return {
      _id: fallback._id,
      name_kh: fallback.name_kh || fallback.name_en || defaultKh,
      name_en: fallback.name_en || fallback.name_kh || defaultEn,
    };
  }
  if (typeof fallback === "string" && fallback) {
    return {
      name_kh: fallback,
      name_en: fallback,
    };
  }
  return {
    name_kh: defaultKh,
    name_en: defaultEn,
  };
}

function getGeoLabel(geo?: string | Geographic | null): string {
  if (!geo) return "Any";
  if (typeof geo === "string") {
    if (/^[0-9a-fA-F]{24}$/.test(geo)) return "Any";
    return geo;
  }
  return geo.name_en || geo.name_kh || "Any";
}

function getGeoIdOrName(geo?: string | Geographic): string | undefined {
  if (!geo) return undefined;
  if (typeof geo === "string") return geo;
  return geo._id || geo.name_en || geo.name_kh;
}

function mapApiTripToTrip(item: any, defaultFrom?: any, defaultTo?: any): Trip {
  const busObj = typeof item.bus === "object" && item.bus ? item.bus : {};
  const scheduleObj =
    typeof item.schedule === "object" && item.schedule ? item.schedule : {};
  const companyObj =
    typeof item.company === "object" && item.company ? item.company : {};

  const busImages: string[] = Array.isArray(busObj.images)
    ? busObj.images
        .map((img: any) => (typeof img === "string" ? img : img?.url))
        .filter(
          (url: any): url is string =>
            typeof url === "string" && url.trim().length > 0,
        )
    : [];

  return {
    id: item._id,
    companyId:
      typeof item.company === "object" && item.company?._id
        ? item.company._id
        : typeof item.company === "string"
          ? item.company
          : undefined,
    company:
      companyObj.name ||
      (typeof item.company === "string" ? item.company : "GreenBus Partner"),
    companyImage: companyObj.image || item.companyImage || undefined,
    busImages: busImages.length > 0 ? busImages : undefined,
    busName: busObj.model_name || "Express Bus",
    busType: (busObj.type as BusType) || "VIP 2-2",
    from: normalizeGeo(scheduleObj.from, defaultFrom, "Phnom Penh", "ភ្នំពេញ"),
    to: normalizeGeo(scheduleObj.to, defaultTo, "Siem Reap", "សៀមរាប"),
    departureTime: scheduleObj.departure_time || "08:00",
    arrivalTime: scheduleObj.arrival_time || "13:00",
    duration: "5h 00m",
    availableSeats: 30 - (item.booked_seats?.length || 0),
    totalSeats: 30,
    price: item.price_per_seat || 15,
    amenities:
      item.amenities && item.amenities.length > 0
        ? item.amenities
        : ["WiFi", "AC", "Water"],
    bookedSeats: item.booked_seats || [],
  };
}

function SearchPage() {
  const searchParams = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const draft = useMemo(() => loadDraft(), []);

  const from = searchParams.from ?? draft?.from;
  const to = searchParams.to ?? draft?.to;
  const date = searchParams.date ?? draft?.date;
  const returnDate = searchParams.returnDate ?? draft?.returnDate;
  const tripType = searchParams.tripType ?? draft?.tripType;
  const schedule = searchParams.schedule ?? draft?.schedule;

  const isRoundTrip =
    tripType === "roundtrip" || (Boolean(returnDate) && returnDate !== "");

  const [apiTrips, setApiTrips] = useState<Trip[]>([]);
  const [fromLocation, setFromLocation] = useState<Geographic | null>(null);
  const [toLocation, setToLocation] = useState<Geographic | null>(null);
  const [activeTab, setActiveTab] = useState<"outbound" | "return">("outbound");
  const [selectedOutbound, setSelectedOutbound] = useState<Trip | null>(
    () => draft?.trip || null,
  );
  const [selectedReturn, setSelectedReturn] = useState<Trip | null>(
    () => draft?.returnTrip || null,
  );

  useEffect(() => {
    const departureDateISO = date ? new Date(date).toISOString() : undefined;
    const returnDateISO =
      isRoundTrip && returnDate ? new Date(returnDate).toISOString() : undefined;

    const requestParams: any = {
      departure_date: departureDateISO,
    };

    if (schedule) {
      requestParams.schedule = schedule;
    } else {
      requestParams.from = getGeoIdOrName(from);
      requestParams.to = getGeoIdOrName(to);
      if (returnDateISO) {
        requestParams.return_date = returnDateISO;
      }
    }

    getJSON("/api/trips/by-schedule", {
      data: requestParams,
      is_alert_error: false,
      is_loading: true,
    })
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map((item: any) => mapApiTripToTrip(item));
          setApiTrips(mapped);

          const firstSchedule = res[0]?.schedule;
          if (firstSchedule?.from) {
            setFromLocation(normalizeGeo(firstSchedule.from));
          }
          if (firstSchedule?.to) {
            setToLocation(normalizeGeo(firstSchedule.to));
          }
        } else if (Array.isArray(res)) {
          setApiTrips([]);
        } else {
          setApiTrips([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch trips from API, using fallback:", err);
        setApiTrips([]);
      });
  }, [schedule, from, to, date, returnDate, isRoundTrip]);

  // Derived display locations prioritizing fetched schedule data
  const displayFrom =
    fromLocation ||
    (apiTrips.length > 0 ? apiTrips[0].from : typeof from === "object" ? from : null);
  const displayTo =
    toLocation ||
    (apiTrips.length > 0 ? apiTrips[0].to : typeof to === "object" ? to : null);

  // Split into outbound and return trips
  const { outboundTrips, returnTrips } = useMemo(() => {
    if (apiTrips.length > 0) {
      const targetFromId = fromLocation?._id || apiTrips[0]?.from?._id;
      const targetToId = toLocation?._id || apiTrips[0]?.to?._id;
      const fromStr = (
        fromLocation?.name_en ||
        fromLocation?.name_kh ||
        getGeoLabel(from)
      ).toLowerCase();
      const toStr = (
        toLocation?.name_en ||
        toLocation?.name_kh ||
        getGeoLabel(to)
      ).toLowerCase();

      const outb: Trip[] = [];
      const ret: Trip[] = [];

      for (const t of apiTrips) {
        const tFromId = t.from._id;
        const tFromKh = (t.from.name_kh || "").toLowerCase();
        const tFromEn = (t.from.name_en || "").toLowerCase();

        const matchesOutbound =
          Boolean(targetFromId && tFromId === targetFromId) ||
          (Boolean(fromStr) && (tFromEn.includes(fromStr) || tFromKh.includes(fromStr)));

        const matchesReturn =
          Boolean(targetToId && tFromId === targetToId) ||
          (Boolean(toStr) && (tFromEn.includes(toStr) || tFromKh.includes(toStr)));

        if (matchesReturn && !matchesOutbound) {
          ret.push(t);
        } else {
          outb.push(t);
        }
      }

      return {
        outboundTrips: outb.length > 0 ? outb : apiTrips,
        returnTrips: ret.length > 0 ? ret : [],
      };
    }

    return {
      outboundTrips: searchTrips(from, to),
      returnTrips: isRoundTrip ? searchTrips(to, from) : [],
    };
  }, [apiTrips, fromLocation, toLocation, from, to, isRoundTrip]);

  const currentTrips = activeTab === "outbound" ? outboundTrips : returnTrips;

  const [maxPrice, setMaxPrice] = useState(50);
  const [timeBuckets, setTimeBuckets] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [amens, setAmens] = useState<string[]>([]);

  const filtered = currentTrips.filter((t) => {
    if (t.price > maxPrice) return false;
    const h = parseInt(t.departureTime.split(":")[0], 10);
    if (
      timeBuckets.length &&
      !timeBuckets.some((k) => TIME_BUCKETS.find((b) => b.key === k)!.test(h))
    )
      return false;
    if (types.length && !types.includes(t.busType)) return false;
    if (amens.length && !amens.every((a) => t.amenities.includes(a)))
      return false;
    return true;
  });

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    val: string,
  ) =>
    setList(
      list.includes(val) ? list.filter((x) => x !== val) : [...list, val],
    );

  const handleSelectTrip = (t: Trip) => {
    if (!isRoundTrip) {
      saveDraft({
        tripId: t.id,
        date: date ?? new Date().toISOString().slice(0, 10),
        selectedSeats: [],
        trip: t,
        from: getGeoIdOrName(from) || from,
        to: getGeoIdOrName(to) || to,
        schedule,
        tripType: "oneway",
      });
      nav({
        to: "/seats",
        search: {
          tripId: t.id,
          date: date ?? "",
          from: getGeoIdOrName(from) || (typeof from === "string" ? from : undefined),
          to: getGeoIdOrName(to) || (typeof to === "string" ? to : undefined),
          schedule: schedule ?? undefined,
          tripType: "oneway",
        },
      });
      return;
    }

    if (activeTab === "outbound") {
      setSelectedOutbound(t);
      toast.success(
        `Selected departure: ${t.company} (${t.departureTime}). Now choose your return bus.`,
      );
      if (!selectedReturn) {
        setActiveTab("return");
      }
    } else {
      setSelectedReturn(t);
      toast.success(`Selected return: ${t.company} (${t.departureTime}).`);
      if (!selectedOutbound) {
        setActiveTab("outbound");
      }
    }
  };

  const handleProceedRoundTrip = () => {
    if (!selectedOutbound) {
      toast.error("Please select a departure bus first");
      setActiveTab("outbound");
      return;
    }
    if (!selectedReturn) {
      toast.error("Please select a return bus");
      setActiveTab("return");
      return;
    }

    saveDraft({
      tripId: selectedOutbound.id,
      date: date ?? new Date().toISOString().slice(0, 10),
      selectedSeats: [],
      trip: selectedOutbound,
      isRoundTrip: true,
      returnTripId: selectedReturn.id,
      returnDate: returnDate ?? date ?? "",
      returnSelectedSeats: [],
      returnTrip: selectedReturn,
      from: getGeoIdOrName(from) || from,
      to: getGeoIdOrName(to) || to,
      schedule,
      tripType: "roundtrip",
    });

    nav({
      to: "/seats",
      search: {
        tripId: selectedOutbound.id,
        date: date ?? "",
        returnTripId: selectedReturn.id,
        returnDate: returnDate ?? "",
        from: getGeoIdOrName(from) || (typeof from === "string" ? from : undefined),
        to: getGeoIdOrName(to) || (typeof to === "string" ? to : undefined),
        schedule: schedule ?? undefined,
        tripType: "roundtrip",
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SiteNav />

      {/* Header Info Bar */}
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {getGeoLabel(displayFrom)}
            </span>
            <span className="text-muted-foreground">
              {isRoundTrip ? (
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {getGeoLabel(displayTo)}
            </span>

            {isRoundTrip && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Round-trip
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Departure: <strong className="text-foreground">{date ?? "Any date"}</strong>
            </span>
            {isRoundTrip && (
              <span>
                Return: <strong className="text-foreground">{returnDate ?? date ?? "Any date"}</strong>
              </span>
            )}
            <span>· {filtered.length} buses</span>
          </div>
        </div>
      </div>

      {/* Round-trip Step Switcher */}
      {isRoundTrip && (
        <div className="bg-background border-b shadow-xs">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("outbound")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  activeTab === "outbound"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-xs font-bold ${
                        selectedOutbound
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selectedOutbound ? "✓" : "1"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Step 1 · Outbound
                    </span>
                  </div>
                  <p className="mt-1 truncate font-bold text-sm">
                    {getGeoLabel(displayFrom)} → {getGeoLabel(displayTo)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date ?? "Select departure date"}
                  </p>
                </div>

                {selectedOutbound ? (
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="border-primary text-primary font-semibold">
                      Selected
                    </Badge>
                    <p className="mt-1 text-xs font-bold">${selectedOutbound.price}</p>
                  </div>
                ) : (
                  <span className="text-xs text-primary font-medium hidden sm:inline">
                    Choose Bus →
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("return")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  activeTab === "return"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-xs font-bold ${
                        selectedReturn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selectedReturn ? "✓" : "2"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Step 2 · Return
                    </span>
                  </div>
                  <p className="mt-1 truncate font-bold text-sm">
                    {getGeoLabel(displayTo)} → {getGeoLabel(displayFrom)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {returnDate ?? date ?? "Select return date"}
                  </p>
                </div>

                {selectedReturn ? (
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="border-primary text-primary font-semibold">
                      Selected
                    </Badge>
                    <p className="mt-1 text-xs font-bold">${selectedReturn.price}</p>
                  </div>
                ) : (
                  <span className="text-xs text-primary font-medium hidden sm:inline">
                    Choose Bus →
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <Filter className="h-4 w-4" /> Filters
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Max price</span>
                  <span className="font-medium">${maxPrice}</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  min={5}
                  max={50}
                  step={1}
                  onValueChange={(v) => setMaxPrice(v[0])}
                />
              </div>
              <FilterGroup title="Departure time">
                {TIME_BUCKETS.map((b) => (
                  <label
                    key={b.key}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={timeBuckets.includes(b.key)}
                      onCheckedChange={() =>
                        toggle(timeBuckets, setTimeBuckets, b.key)
                      }
                    />
                    {b.label}
                  </label>
                ))}
              </FilterGroup>
              <FilterGroup title="Bus type">
                {BUS_TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={types.includes(t)}
                      onCheckedChange={() => toggle(types, setTypes, t)}
                    />
                    {t}
                  </label>
                ))}
              </FilterGroup>
              <FilterGroup title="Amenities">
                {AMENITIES.map((a) => (
                  <label
                    key={a}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={amens.includes(a)}
                      onCheckedChange={() => toggle(amens, setAmens, a)}
                    />
                    {a}
                  </label>
                ))}
              </FilterGroup>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div className="space-y-4">
          {isRoundTrip && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm flex items-center justify-between">
              <div>
                <span className="font-semibold text-primary">
                  {activeTab === "outbound"
                    ? "Showing Departure Buses"
                    : "Showing Return Buses"}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeTab === "outbound"
                    ? `From ${getGeoLabel(displayFrom)} to ${getGeoLabel(displayTo)} on ${date ?? "selected date"}`
                    : `From ${getGeoLabel(displayTo)} to ${getGeoLabel(displayFrom)} on ${returnDate ?? date ?? "selected date"}`}
                </p>
              </div>
              <Badge variant="outline">
                {filtered.length} options
              </Badge>
            </div>
          )}

          {filtered.length === 0 && (
            <Card className="p-10 text-center">
              <Bus className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No trips match your criteria</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your price or time filters.
              </p>
            </Card>
          )}

          {filtered.map((t) => {
            const isCurrentlySelected = isRoundTrip
              ? activeTab === "outbound"
                ? selectedOutbound?.id === t.id
                : selectedReturn?.id === t.id
              : false;

            return (
              <Card
                key={t.id}
                className={`overflow-hidden p-0 card-hover transition-all ${
                  isCurrentlySelected
                    ? "border-2 border-primary bg-primary/5"
                    : ""
                }`}
              >
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      {t.companyImage && (
                        <img
                          src={t.companyImage}
                          alt={t.company}
                          className="h-12 w-12 rounded-xl border border-border bg-card object-contain p-1 shadow-xs shrink-0"
                        />
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-accent text-primary font-bold text-sm px-2.5 py-1"
                        >
                          {t.company}
                        </Badge>
                        <Badge variant="outline">{t.busType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          · {t.busName}
                        </span>
                        {isCurrentlySelected && (
                          <Badge className="bg-primary text-primary-foreground gap-1">
                            <Check className="h-3 w-3" /> Selected for {activeTab === "outbound" ? "Departure" : "Return"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 items-center gap-3">
                      <div>
                        <div className="text-xl font-bold">{t.departureTime}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.from.name_en || t.from.name_kh}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">
                          {t.duration}
                        </div>
                        <div className="relative mt-1">
                          <div className="h-px w-full bg-border" />
                          <Bus className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary bg-card px-0.5" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{t.arrivalTime}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.to.name_en || t.to.name_kh}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {t.availableSeats} seats left
                      </span>
                      {t.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="inline-flex items-center gap-1">
                          <Wifi className="h-3.5 w-3.5" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 border-t pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-primary">
                        ${t.price}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per seat
                      </div>
                    </div>
                    <Button
                      variant={isCurrentlySelected ? "outline" : "default"}
                      onClick={() => handleSelectTrip(t)}
                    >
                      {isRoundTrip
                        ? isCurrentlySelected
                          ? "Change Bus"
                          : activeTab === "outbound"
                            ? "Select Departure"
                            : "Select Return"
                        : "Select Seats"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Bar for Round-trip Selection */}
      {isRoundTrip && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-4 backdrop-blur shadow-elevated">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Departure:</span>
                {selectedOutbound ? (
                  <span className="font-semibold text-foreground">
                    {selectedOutbound.company} ({selectedOutbound.departureTime}) · ${selectedOutbound.price}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Not selected
                  </span>
                )}
              </div>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Return:</span>
                {selectedReturn ? (
                  <span className="font-semibold text-foreground">
                    {selectedReturn.company} ({selectedReturn.departureTime}) · ${selectedReturn.price}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Not selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedOutbound && selectedReturn && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Est. Total:</span>
                  <p className="text-lg font-black text-primary">
                    ${selectedOutbound.price + selectedReturn.price}
                    <span className="text-xs font-normal text-muted-foreground"> /seat</span>
                  </p>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleProceedRoundTrip}
                className="gap-2 font-bold"
                disabled={!selectedOutbound || !selectedReturn}
              >
                {!selectedOutbound
                  ? "Select Departure Bus"
                  : !selectedReturn
                    ? "Select Return Bus"
                    : "Select Seats"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

