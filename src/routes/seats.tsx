import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { ArrowLeftRight, ArrowRight, Bus, Check, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site-nav";
import { SeatMap } from "@/components/seat-map";
import {
  getTrip,
  saveDraft,
  loadDraft,
  type BusType,
  type Trip,
  type Geographic,
} from "@/lib/booking-data";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

const searchSchema = z.object({
  tripId: z.string(),
  date: z.string().optional(),
  returnTripId: z.string().optional(),
  returnDate: z.string().optional(),
  from: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  to: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  schedule: z.string().optional(),
  tripType: z.enum(["oneway", "roundtrip"]).optional(),
});

export const Route = createFileRoute("/seats")({
  validateSearch: searchSchema,
  component: SeatsPage,
  head: () => ({
    meta: [
      { title: "Select Your Seats | GreenLine Bus Booking" },
      {
        name: "description",
        content:
          "Pick your seats on the interactive bus seat map, review bus photos, amenities and boarding points before you book.",
      },
    ],
  }),
});

const DEFAULT_GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    alt: "Exterior of the coach bus parked on the road",
  },
  {
    url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80",
    alt: "Interior of the bus with green reclining seats",
  },
  {
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    alt: "Bus fleet lined up at the station",
  },
];

const TABS = [
  "Why book this bus?",
  "Boarding point",
  "Dropping point",
  "Amenities",
] as const;

function normalizeGeo(
  geo: any,
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
  if (typeof geo === "string" && geo) {
    return {
      name_kh: geo,
      name_en: geo,
    };
  }
  return {
    name_kh: defaultKh,
    name_en: defaultEn,
  };
}

function parseApiTripDetail(item: any): Trip {
  const busObj =
    typeof item.bus === "object" && item.bus !== null ? item.bus : {};
  const scheduleObj =
    typeof item.schedule === "object" && item.schedule !== null
      ? item.schedule
      : {};
  const companyObj =
    typeof item.company === "object" && item.company !== null
      ? item.company
      : {};

  const busImages: string[] = Array.isArray(busObj.images)
    ? busObj.images
        .map((img: any) => (typeof img === "string" ? img : img?.url))
        .filter(
          (url: any): url is string =>
            typeof url === "string" && url.trim().length > 0,
        )
    : [];

  return {
    _id: item._id,
    companyId:
      typeof item.company === "object" ? item.company._id : item.company,
    company:
      companyObj.name ||
      (typeof item.company === "string" ? item.company : "GreenBus Partner"),
    companyImage: companyObj.image || item.companyImage || undefined,
    busImages: busImages.length > 0 ? busImages : undefined,
    busName: busObj.model_name || "Express Bus",
    busType: (busObj.type as BusType) || "VIP 2-2",
    from: normalizeGeo(scheduleObj.from, "Phnom Penh", "ភ្នំពេញ"),
    to: normalizeGeo(scheduleObj.to, "Siem Reap", "សៀមរាប"),
    departureTime: scheduleObj.departure_time || "08:00",
    arrivalTime: scheduleObj.arrival_time || "13:00",
    duration: "5h 00m",
    availableSeats:
      30 -
      ((item.booked_seats?.length || 0) +
        (item.seat_holds?.length || item.seatHolds?.length || 0)),
    totalSeats: 30,
    price: item.price_per_seat || 15,
    amenities:
      item.amenities && item.amenities.length > 0
        ? item.amenities
        : ["WiFi", "AC", "Water"],
    bookedSeats: item.booked_seats || item.bookedSeats || [],
    seatHolds: item.seat_holds || item.seatHolds || [],
  };
}

function SeatsPage() {
  const {
    tripId,
    date,
    returnTripId,
    returnDate,
    from,
    to,
    schedule,
    tripType,
  } = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });

  const isRoundTrip = Boolean(returnTripId);

  const staticTrip = getTrip(tripId);
  const staticReturnTrip = returnTripId ? getTrip(returnTripId) : undefined;

  const [trip, setTrip] = useState<Trip | undefined>(staticTrip);
  const [returnTrip, setReturnTrip] = useState<Trip | undefined>(
    staticReturnTrip,
  );
  const [loading, setLoading] = useState<boolean>(
    !staticTrip || (isRoundTrip && !staticReturnTrip),
  );

  const [draft] = useState(() => loadDraft());
  const initial = draft && draft.tripId === tripId ? draft.selectedSeats : [];
  const initialReturn =
    draft && draft.returnTripId === returnTripId
      ? draft.returnSelectedSeats || []
      : [];

  const [selected, setSelected] = useState<string[]>(initial);
  const [returnSelected, setReturnSelected] = useState<string[]>(initialReturn);
  const [activeLeg, setActiveLeg] = useState<"departure" | "return">(
    "departure",
  );
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departure trip
  useEffect(() => {
    let isMounted = true;
    const promises: Promise<any>[] = [];

    if (!staticTrip && tripId) {
      promises.push(
        apiClient
          .get(`/api/trips/detail/${tripId}`)
          .then((res) => {
            if (isMounted && res.data && res.data._id) {
              setTrip(parseApiTripDetail(res.data));
            }
          })
          .catch((err) => {
            console.error("Failed to fetch departure trip:", err);
          }),
      );
    }

    if (isRoundTrip && !staticReturnTrip && returnTripId) {
      promises.push(
        apiClient
          .get(`/api/trips/detail/${returnTripId}`)
          .then((res) => {
            if (isMounted && res.data && res.data._id) {
              setReturnTrip(parseApiTripDetail(res.data));
            }
          })
          .catch((err) => {
            console.error("Failed to fetch return trip:", err);
          }),
      );
    }

    if (promises.length > 0) {
      setLoading(true);
      Promise.all(promises).finally(() => {
        if (isMounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [tripId, returnTripId, staticTrip, staticReturnTrip, isRoundTrip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center p-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading seat map...
          </p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-md p-10 text-center">
          <p>Departure trip not found.</p>
          <Button className="mt-4" onClick={() => nav({ to: "/search" })}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const currentActiveTrip =
    activeLeg === "departure" ? trip : returnTrip || trip;
  const currentSelectedSeats =
    activeLeg === "departure" ? selected : returnSelected;

  const toggle = (seat: string) => {
    if (activeLeg === "departure") {
      setSelected((s) =>
        s.includes(seat) ? s.filter((x) => x !== seat) : [...s, seat],
      );
    } else {
      setReturnSelected((s) =>
        s.includes(seat) ? s.filter((x) => x !== seat) : [...s, seat],
      );
    }
  };

  const departureSubtotal = selected.length * trip.price;
  const returnSubtotal =
    isRoundTrip && returnTrip ? returnSelected.length * returnTrip.price : 0;
  const grandTotal = departureSubtotal + returnSubtotal;

  const proceed = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one seat for your departure trip");
      setActiveLeg("departure");
      return;
    }

    if (isRoundTrip && returnSelected.length === 0) {
      toast.error("Please select at least one seat for your return trip");
      setActiveLeg("return");
      return;
    }

    setIsSubmitting(true);
    let bookingId = draft?.bookingId;
    let returnBookingId = draft?.returnBookingId;

    try {
      // Outbound booking draft
      const payload: any = {
        trip: trip._id,
        booked_seats: selected,
        total_price: departureSubtotal,
        status: "pending",
      };
      if (trip.companyId) {
        payload.company = trip.companyId;
      }

      if (bookingId) {
        await apiClient.patch(`/api/seat-holds/${bookingId}`, payload);
      } else {
        const res = await apiClient.post("/api/seat-holds", payload);
        if (res.data?.data?._id) {
          bookingId = res.data.data._id;
        }
      }

      // Return booking draft if round-trip
      if (isRoundTrip && returnTrip) {
        const returnPayload: any = {
          trip: returnTrip._id,
          booked_seats: returnSelected,
          total_price: returnSubtotal,
          status: "pending",
        };
        if (returnTrip.companyId) {
          returnPayload.company = returnTrip.companyId;
        }

        if (returnBookingId) {
          await apiClient.patch(
            `/api/bookings/${returnBookingId}`,
            returnPayload,
          );
        } else {
          const res = await apiClient.post("/api/bookings", returnPayload);
          if (res.data?.data?._id) {
            returnBookingId = res.data.data._id;
          }
        }
      }
    } catch (apiErr) {
      console.warn("Could not save draft booking to backend API:", apiErr);
    }

    saveDraft({
      bookingId,
      tripId,
      date: date ?? "",
      selectedSeats: selected,
      trip,
      isRoundTrip,
      returnTripId: isRoundTrip ? returnTripId : undefined,
      returnDate: isRoundTrip ? (returnDate ?? date) : undefined,
      returnSelectedSeats: isRoundTrip ? returnSelected : undefined,
      returnTrip: isRoundTrip ? returnTrip : undefined,
      returnBookingId: isRoundTrip ? returnBookingId : undefined,
    });

    setIsSubmitting(false);
    nav({ to: "/passenger" });
  };

  const tabContent: Record<string, React.ReactNode> = {
    "Why book this bus?": (
      <ul className="space-y-2">
        <li>
          Rated {currentActiveTrip.company} service with professional,
          experienced drivers.
        </li>
        <li>
          {currentActiveTrip.busType} configuration with generous legroom and
          comfortable seats.
        </li>
        <li>On-time departure record and clean amenities.</li>
      </ul>
    ),
    "Boarding point": (
      <p>
        {currentActiveTrip.from.name_en || currentActiveTrip.from.name_kh}{" "}
        Terminal — please arrive 20 minutes before the{" "}
        {currentActiveTrip.departureTime} departure.
      </p>
    ),
    "Dropping point": (
      <p>
        {currentActiveTrip.to.name_en || currentActiveTrip.to.name_kh} Main
        Station, arriving around {currentActiveTrip.arrivalTime}.
      </p>
    ),
    Amenities: (
      <div className="flex flex-wrap gap-2">
        {currentActiveTrip.amenities.map((a) => (
          <span
            key={a}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {a}
          </span>
        ))}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-muted/40 pb-28">
      {/* Header: close + route */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  nav({
                    to: "/search",
                    search: {
                      from:
                        typeof from === "string"
                          ? from
                          : draft?.from
                            ? typeof draft.from === "string"
                              ? draft.from
                              : draft.from._id
                            : undefined,
                      to:
                        typeof to === "string"
                          ? to
                          : draft?.to
                            ? typeof draft.to === "string"
                              ? draft.to
                              : draft.to._id
                            : undefined,
                      date: date || draft?.date,
                      returnDate: returnDate || draft?.returnDate,
                      tripType:
                        tripType ||
                        draft?.tripType ||
                        (isRoundTrip ? "roundtrip" : "oneway"),
                      schedule: schedule || draft?.schedule,
                    },
                  });
                }
              }}
              aria-label="Back to search results"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                {trip.from.name_en || trip.from.name_kh}
                {isRoundTrip ? (
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
                {trip.to.name_en || trip.to.name_kh}
              </h1>
              {isRoundTrip && (
                <span className="text-xs text-primary font-semibold">
                  Round-trip Booking
                </span>
              )}
            </div>
          </div>

          {/* Steps indicator */}
          <div className="hidden sm:flex items-center gap-6">
            {["1. Select seats", "2. Passenger details", "3. Payment"].map(
              (s, i) => (
                <span
                  key={s}
                  className={`text-sm font-medium ${
                    i === 0 ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Round-trip leg tabs switcher */}
        {isRoundTrip && (
          <div className="border-t bg-secondary/30 px-4">
            <div className="mx-auto flex max-w-7xl gap-2 py-2">
              <button
                type="button"
                onClick={() => setActiveLeg("departure")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeLeg === "departure"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bus className="h-4 w-4" />
                <span>1. Departure Seats</span>
                {selected.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-white/20 text-white text-xs px-1.5"
                  >
                    {selected.length}
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveLeg("return")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeLeg === "return"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bus className="h-4 w-4" />
                <span>2. Return Seats</span>
                {returnSelected.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-white/20 text-white text-xs px-1.5"
                  >
                    {returnSelected.length}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_420px]">
        {/* Left: bus details */}
        <section className="h-fit min-w-0 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div>
              <Badge
                variant="outline"
                className="text-xs font-semibold text-primary"
              >
                {activeLeg === "departure"
                  ? "Departure Bus Details"
                  : "Return Bus Details"}
              </Badge>
              <p className="mt-1 text-sm font-bold">
                {currentActiveTrip.from.name_en ||
                  currentActiveTrip.from.name_kh}{" "}
                → {currentActiveTrip.to.name_en || currentActiveTrip.to.name_kh}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Date:{" "}
              <strong>
                {activeLeg === "departure"
                  ? date || "Today"
                  : returnDate || date || "Return Date"}
              </strong>
            </p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {currentActiveTrip.companyImage && (
                <img
                  src={currentActiveTrip.companyImage}
                  alt={currentActiveTrip.company}
                  className="h-14 w-14 rounded-2xl border border-border bg-card object-contain p-1.5 shadow-sm shrink-0"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {currentActiveTrip.company}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {currentActiveTrip.departureTime} -{" "}
                  {currentActiveTrip.arrivalTime} · {currentActiveTrip.duration}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentActiveTrip.busName} · {currentActiveTrip.busType}
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              <Star className="h-3 w-3 fill-current" /> 4.8
            </span>
          </div>

          {/* Gallery */}
          {(() => {
            const galleryImages =
              currentActiveTrip.busImages &&
              currentActiveTrip.busImages.length > 0
                ? currentActiveTrip.busImages.map((url, i) => ({
                    url,
                    alt: `${currentActiveTrip.busName} photo ${i + 1}`,
                  }))
                : DEFAULT_GALLERY;

            return (
              <div className="-mx-1 mt-5 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
                {galleryImages.map((img, i) => (
                  <img
                    key={img.url + i}
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    width={1024}
                    height={640}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        DEFAULT_GALLERY[i % DEFAULT_GALLERY.length].url;
                    }}
                    className="h-40 w-64 shrink-0 snap-start rounded-2xl object-cover transition-transform hover:scale-[1.02] sm:h-44 sm:w-72"
                  />
                ))}
              </div>
            );
          })()}

          {/* Tabs */}
          <div className="mt-4 flex gap-5 overflow-x-auto border-b border-border">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="pt-5 text-sm leading-relaxed text-muted-foreground">
            {tabContent[tab]}
          </div>
        </section>

        {/* Right: seat map & summary */}
        <section className="min-w-0 space-y-6">
          <SeatMap
            busType={currentActiveTrip.busType}
            bookedSeats={currentActiveTrip.bookedSeats}
            seatHolds={currentActiveTrip.seatHolds}
            selected={currentSelectedSeats}
            onToggle={toggle}
          />

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h3 className="text-sm font-bold flex items-center justify-between">
              <span>Booking Summary</span>
              {isRoundTrip && (
                <Badge variant="secondary" className="text-xs">
                  2 Trips (Round-trip)
                </Badge>
              )}
            </h3>

            <div className="mt-4 space-y-3 divide-y text-sm">
              <div className="pt-2">
                <div className="flex justify-between font-semibold">
                  <span>
                    1. Departure ({trip.from.name_en} → {trip.to.name_en})
                  </span>
                  <span>${departureSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Seats: {selected.join(", ") || "None"}</span>
                  <span>
                    {selected.length} × ${trip.price}
                  </span>
                </div>
              </div>

              {isRoundTrip && returnTrip && (
                <div className="pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>
                      2. Return ({returnTrip.from.name_en} →{" "}
                      {returnTrip.to.name_en})
                    </span>
                    <span>${returnSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Seats: {returnSelected.join(", ") || "None"}</span>
                    <span>
                      {returnSelected.length} × ${returnTrip.price}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-between font-extrabold text-base text-primary">
                <span>Total Amount</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Bus className="h-4 w-4 text-primary" />
            <div>
              <span className="font-semibold text-foreground">
                {isRoundTrip
                  ? `${selected.length} dep + ${returnSelected.length} ret seats`
                  : `${selected.length} seat(s)`}
              </span>
              <span className="mx-2 text-border">|</span>
              <span className="text-lg font-bold text-primary">
                USD ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isRoundTrip && activeLeg === "departure" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (selected.length === 0) {
                    toast.error("Please select departure seats first");
                    return;
                  }
                  setActiveLeg("return");
                }}
              >
                Next: Select Return Seats →
              </Button>
            )}

            <Button
              size="lg"
              className="gap-2 rounded-full px-8 font-bold"
              onClick={proceed}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to passenger info <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
