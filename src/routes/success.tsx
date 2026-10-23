import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Download, Eye, Home, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site-nav";
import {
  getStoredBookingTokens,
  clearDraft,
  type Booking,
  type StoredBookingRef,
} from "@/lib/booking-data";
import { downloadBookingInvoice } from "@/lib/invoice";
import { apiClient } from "@/api/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/success")({
  validateSearch: z.object({ booking_code: z.string() }),
  component: SuccessPage,
});

function formatTripDate(rawDate?: string | Date): string {
  if (!rawDate) return "N/A";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    return d.toISOString().split("T")[0];
  } catch {
    return String(rawDate);
  }
}

function normalizeBooking(apiItem: any, storedRef?: StoredBookingRef): Booking {
  const trip = apiItem.trip || {};
  const bus = trip.bus || {};
  const schedule = trip.schedule || {};
  const company = trip.company || apiItem.company || {};
  const user = apiItem.user || {};
  const userInfo = apiItem.user_info || {};

  const fromName =
    schedule.from?.name_en ||
    schedule.from?.name_kh ||
    (typeof schedule.from === "string" ? schedule.from : "Phnom Penh");
  const toName =
    schedule.to?.name_en ||
    schedule.to?.name_kh ||
    (typeof schedule.to === "string" ? schedule.to : "Siem Reap");

  const companyName =
    company.name ||
    (typeof company === "string" ? company : "GreenBus Partner");
  const companyId =
    company._id ||
    (typeof company === "string" ? company : trip.company?._id || trip.company);

  const busName =
    bus.model_name || bus.bus_number || trip.busName || "Express Bus";

  const departureDate = formatTripDate(
    trip.departure_date || apiItem.createdAt,
  );
  const departureTime =
    schedule.departure_time || trip.departure_time || "08:00";

  const passengerName =
    userInfo.name ||
    userInfo.fullName ||
    user.name ||
    user.fullName ||
    "Passenger";
  const passengerPhone =
    userInfo.phone || user.phone || user.phoneNumber || "N/A";
  const passengerEmail = userInfo.email || user.email || "N/A";

  const statusRaw = (apiItem.status || "CONFIRMED").toUpperCase();
  const status: "Confirmed" | "Cancelled" =
    statusRaw === "CANCELLED" || statusRaw === "CANCELED"
      ? "Cancelled"
      : "Confirmed";

  return {
    access_token: storedRef?.access_token || apiItem.accessTokenHash,
    booking_code: apiItem.booking_code || storedRef?.booking_code || "",
    tripId: trip._id || trip,
    company: companyName,
    companyId: companyId,
    busName: busName,
    from: fromName,
    to: toName,
    date: departureDate,
    departureTime: departureTime,
    seats: Array.isArray(apiItem.booked_seats) ? apiItem.booked_seats : [],
    passenger: {
      fullName: passengerName,
      phone: passengerPhone,
      email: passengerEmail,
    },
    total: typeof apiItem.total_price === "number" ? apiItem.total_price : 0,
    paymentMethod: storedRef?.paymentMethod || "KHQR",
    paymentStatus: "Paid",
    status: status,
    createdAt: apiItem.createdAt || new Date().toISOString(),
    hasFeedback: storedRef?.hasFeedback ?? false,
  };
}

function SuccessPage() {
  const { booking_code } = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearDraft();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const storedTokens = getStoredBookingTokens();
        const storedRef = storedTokens.find(
          (b) => b.booking_code === booking_code,
        );
        const params: Record<string, string> = { booking_code };
        if (storedRef?.access_token) {
          params.access_token = storedRef.access_token;
        }
        const res = await apiClient.get("/api/bookings", { params });
        const data = res.data?.data;
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setBooking(normalizeBooking(data[0], storedRef));
          } else if (data && typeof data === "object" && !Array.isArray(data)) {
            setBooking(normalizeBooking(data, storedRef));
          } else {
            setBooking(null);
          }
        }
      } catch (err) {
        console.warn("Could not fetch booking from /api/bookings:", err);
        if (isMounted) setBooking(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooking();
    return () => {
      isMounted = false;
    };
  }, [booking_code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-sm text-muted-foreground">Loading your booking details...</p>
      </div>
    );
  }

  if (!booking)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <p className="text-lg font-semibold">Booking not found</p>
        <Button className="mt-4" onClick={() => nav({ to: "/" })}>
          Return Home
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-12">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <div className="relative grid h-20 w-20 place-items-center rounded-full hero-gradient text-primary-foreground shadow-elevated">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold">
          Booking Confirmed!
        </h1>
        {/* <p className="mt-2 text-center text-muted-foreground">
          Your e-ticket has been sent to{" "}
          <strong className="text-foreground">{booking.passenger.email}</strong>
        </p> */}

        <Card className="mt-8 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Booking Reference
              </p>
              <p className="mt-1 text-2xl font-black text-primary">
                {booking.booking_code}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {booking.isRoundTrip && (
                <Badge variant="outline" className="text-primary font-bold">
                  Round-trip
                </Badge>
              )}
              <Badge className="bg-emerald-500 text-white font-medium">
                {booking.status}
              </Badge>
            </div>
          </div>

          {/* Outbound ticket */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <Bus className="h-3.5 w-3.5 text-primary" /> 1. Outbound Ticket
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-secondary/30 p-4 text-sm">
              <Info
                label="Bus"
                value={`${booking.company} · ${booking.busName}`}
              />
              <Info label="Route" value={`${booking.from} → ${booking.to}`} />
              <Info
                label="Departure"
                value={`${booking.date} · ${booking.departureTime}`}
              />
              <Info label="Seats" value={booking.seats.join(", ")} />
            </div>
          </div>

          {/* Return ticket if round trip */}
          {booking.isRoundTrip && booking.returnFrom && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <Bus className="h-3.5 w-3.5 text-primary" /> 2. Return Ticket
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-secondary/30 p-4 text-sm">
                <Info
                  label="Bus"
                  value={`${booking.returnCompany || booking.company} · ${booking.returnBusName || booking.busName}`}
                />
                <Info
                  label="Route"
                  value={`${booking.returnFrom} → ${booking.returnTo}`}
                />
                <Info
                  label="Departure"
                  value={`${booking.returnDate || booking.date} · ${booking.returnDepartureTime || ""}`}
                />
                <Info
                  label="Seats"
                  value={booking.returnSeats?.join(", ") || "Selected"}
                />
              </div>
            </div>
          )}

          {/* Passenger & Price info */}
          <div className="border-t pt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <Info label="Passenger" value={booking.passenger.fullName} />
            <Info label="Contact Phone" value={booking.passenger.phone} />
            <Info label="Payment Method" value={booking.paymentMethod} />
            <Info label="Total Paid" value={`$${booking.total.toFixed(2)}`} />
          </div>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => downloadBookingInvoice(booking)}
          >
            <Download className="h-4 w-4" /> Download Ticket
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => nav({ to: "/booking" })}
          >
            <Eye className="h-4 w-4" /> My Bookings
          </Button>
          <Button className="gap-2" onClick={() => nav({ to: "/" })}>
            <Home className="h-4 w-4" /> Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}
