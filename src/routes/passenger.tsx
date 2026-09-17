import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  getTrip,
  loadDraft,
  saveDraft,
  type Trip,
  type BusType,
  type Geographic,
} from "@/lib/booking-data";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Bus } from "lucide-react";

export const Route = createFileRoute("/passenger")({
  component: PassengerPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phone: z.string().trim().min(6, "Phone number is required").max(20),
  email: z.string().trim().email("Valid email address is required").max(255),
  notes: z.string().trim().max(500).optional(),
});

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
  const busObj = typeof item.bus === "object" && item.bus ? item.bus : {};
  const scheduleObj =
    typeof item.schedule === "object" && item.schedule ? item.schedule : {};
  const companyObj =
    typeof item.company === "object" && item.company ? item.company : {};

  return {
    _id: item._id,
    companyId:
      typeof item.company === "object" ? item.company._id : item.company,
    company:
      companyObj.name ||
      (typeof item.company === "string" ? item.company : "GreenBus Partner"),
    companyImage: companyObj.image || item.companyImage || undefined,
    busName: busObj.model_name || "Express Bus",
    busType: (busObj.type as BusType) || "VIP 2-2",
    from: normalizeGeo(scheduleObj.from, "Phnom Penh", "ភ្នំពេញ"),
    to: normalizeGeo(scheduleObj.to, "Siem Reap", "សៀមរាប"),
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

function PassengerPage() {
  const nav = useNavigate({ from: Route.fullPath });
  const [draft] = useState(() => loadDraft());
  const staticTrip = draft?.trip || (draft ? getTrip(draft.tripId) : undefined);
  const staticReturnTrip =
    draft?.returnTrip ||
    (draft?.returnTripId ? getTrip(draft.returnTripId) : undefined);

  const [trip, setTrip] = useState<Trip | undefined>(staticTrip);
  const [returnTrip, setReturnTrip] = useState<Trip | undefined>(
    staticReturnTrip,
  );
  const [loading, setLoading] = useState<boolean>(
    !staticTrip && !!draft?.tripId,
  );

  const [form, setForm] = useState({
    fullName: draft?.passenger?.fullName || "",
    phone: draft?.passenger?.phone || "",
    email: draft?.passenger?.email || "",
    notes: draft?.passenger?.notes || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const promises: Promise<any>[] = [];

    if (!staticTrip && draft?.tripId) {
      promises.push(
        apiClient
          .get(`/api/trips/detail/${draft.tripId}`)
          .then((res) => {
            if (isMounted && res.data && res.data._id) {
              setTrip(parseApiTripDetail(res.data));
            }
          })
          .catch((err) => {
            console.error("Failed to fetch departure trip detail:", err);
          }),
      );
    }

    if (draft?.isRoundTrip && !staticReturnTrip && draft.returnTripId) {
      promises.push(
        apiClient
          .get(`/api/trips/detail/${draft.returnTripId}`)
          .then((res) => {
            if (isMounted && res.data && res.data._id) {
              setReturnTrip(parseApiTripDetail(res.data));
            }
          })
          .catch((err) => {
            console.error("Failed to fetch return trip detail:", err);
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
  }, [draft?.tripId, draft?.returnTripId, staticTrip, staticReturnTrip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center p-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading passenger form details...
          </p>
        </div>
      </div>
    );
  }

  if (!draft || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-md p-10 text-center">
          <h2 className="text-xl font-semibold">No active booking</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please select your seats first before filling out passenger details.
          </p>
          <div className="mt-6">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Search Buses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const departureSubtotal = (draft.selectedSeats?.length || 0) * trip.price;
  const returnSubtotal =
    draft.isRoundTrip && returnTrip
      ? (draft.returnSelectedSeats?.length || 0) * returnTrip.price
      : 0;
  const grandTotal = departureSubtotal + returnSubtotal;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast.error("Please fill in all required passenger information");
      return;
    }

    setIsSubmitting(true);
    const currentDraft = loadDraft() || draft;
    const bookingId = currentDraft?.bookingId;
    const returnBookingId = currentDraft?.returnBookingId;

    // try {
    //   if (bookingId) {
    //     await apiClient.patch(`/api/bookings/${bookingId}`, {
    //       user_info: r.data,
    //     });
    //   }
    //   if (returnBookingId) {
    //     await apiClient.patch(`/api/bookings/${returnBookingId}`, {
    //       user_info: r.data,
    //     });
    //   }
    // } catch (apiErr) {
    //   console.warn("Could not update passenger details on API:", apiErr);
    // }

    saveDraft({
      ...currentDraft,
      trip,
      returnTrip: returnTrip || currentDraft.returnTrip,
      passenger: r.data,
    });
    setIsSubmitting(false);
    nav({ to: "/payment" });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <SiteNav />

      {/* Header with back button and steps */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            to="/seats"
            search={{
              tripId: trip._id,
              date: draft.date || "",
              returnTripId: draft.returnTripId,
              returnDate: draft.returnDate,
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Seat Map
          </Link>
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium">
            <span className="text-muted-foreground">1. Select seats</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-primary font-bold">2. Passenger info</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">3. Payment</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">
            Passenger Information
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please enter your contact details so we can issue your e-ticket(s).
          </p>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <Field
              htmlFor="fullName"
              label="Full Name *"
              error={errors.fullName}
            >
              <Input
                id="fullName"
                name="fullName"
                placeholder="e.g. Sokha Chan"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={
                  errors.fullName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                htmlFor="phone"
                label="Phone Number *"
                error={errors.phone}
              >
                <Input
                  id="phone"
                  name="phone"
                  placeholder="e.g. 012345678"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={
                    errors.phone
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
              </Field>

              <Field
                htmlFor="email"
                label="Email Address *"
                error={errors.email}
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. sokha@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
              </Field>
            </div>

            <Field
              htmlFor="notes"
              label="Special Requests / Notes (optional)"
              error={errors.notes}
            >
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any dietary needs, pickup location notes, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>

            <div className="pt-2 flex flex-wrap gap-3 items-center justify-between">
              <Link
                to="/seats"
                search={{
                  tripId: trip._id,
                  date: draft.date || "",
                  returnTripId: draft.returnTripId,
                  returnDate: draft.returnDate,
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Change Seats
              </Link>

              <Button
                type="submit"
                size="lg"
                className="gap-2 rounded-full px-7 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving details...
                  </>
                ) : (
                  <>
                    Continue to Payment <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Summary */}
        <Card className="h-fit p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-foreground">
              Booking Summary
            </h3>
            {draft.isRoundTrip && (
              <Badge variant="secondary" className="text-xs">
                Round-trip
              </Badge>
            )}
          </div>

          {/* Outbound overview */}
          <div className="space-y-2 border-b pb-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Bus className="h-4 w-4" /> 1. Departure Trip
            </div>
            <SumRow
              label="Route"
              value={`${trip.from.name_en || trip.from.name_kh} → ${trip.to.name_en || trip.to.name_kh}`}
            />
            <SumRow label="Date" value={draft.date || "Today"} />
            <SumRow
              label="Operator"
              value={`${trip.company} (${trip.departureTime})`}
            />
            <SumRow
              label="Seats"
              value={draft.selectedSeats?.join(", ") || "None"}
            />
            <SumRow
              label="Subtotal"
              value={`$${departureSubtotal.toFixed(2)}`}
            />
          </div>

          {/* Return overview if round trip */}
          {draft.isRoundTrip && returnTrip && (
            <div className="space-y-2 border-b pb-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Bus className="h-4 w-4" /> 2. Return Trip
              </div>
              <SumRow
                label="Route"
                value={`${returnTrip.from.name_en || returnTrip.from.name_kh} → ${returnTrip.to.name_en || returnTrip.to.name_kh}`}
              />
              <SumRow
                label="Date"
                value={draft.returnDate || draft.date || "Return Date"}
              />
              <SumRow
                label="Operator"
                value={`${returnTrip.company} (${returnTrip.departureTime})`}
              />
              <SumRow
                label="Seats"
                value={draft.returnSelectedSeats?.join(", ") || "None"}
              />
              <SumRow
                label="Subtotal"
                value={`$${returnSubtotal.toFixed(2)}`}
              />
            </div>
          )}

          <div className="flex justify-between text-base font-bold pt-1 text-foreground">
            <span>Total to Pay</span>
            <span className="text-primary text-xl">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs sm:text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
