import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Download, Eye, Home, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site-nav";
import { getBookings, clearDraft } from "@/lib/booking-data";
import { useEffect } from "react";

export const Route = createFileRoute("/success")({
  validateSearch: z.object({ ref: z.string() }),
  component: SuccessPage,
});

function SuccessPage() {
  const { ref } = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const booking = getBookings().find((b) => b.ref === ref);

  useEffect(() => {
    clearDraft();
  }, []);

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
        <p className="mt-2 text-center text-muted-foreground">
          Your e-ticket has been sent to{" "}
          <strong className="text-foreground">{booking.passenger.email}</strong>
        </p>

        <Card className="mt-8 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Booking Reference
              </p>
              <p className="mt-1 text-2xl font-black text-primary">
                {booking.ref}
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
          <Button variant="outline" className="gap-2">
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

