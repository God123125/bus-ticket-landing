import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Bus,
  Calendar,
  Download,
  Eye,
  MapPin,
  Ticket,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getBookings, updateBooking, type Booking } from "@/lib/booking-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/booking")({ component: BookingsPage });

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Booking | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setBookings(getBookings());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const cancel = (ref: string) => {
    updateBooking(ref, { status: "Cancelled" });
    setBookings(getBookings());
    toast.success("Booking cancelled");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">My bookings</h1>
        <p className="text-sm text-muted-foreground">
          All your trips in one place.
        </p>

        <div className="mt-6 space-y-4">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-6">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
                <div className="mt-3 h-3 w-1/4 rounded bg-muted" />
              </Card>
            ))}
          {!loading && bookings.length === 0 && (
            <Card className="p-10 text-center">
              <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No bookings yet</p>
              <p className="text-sm text-muted-foreground">
                Your future trips will appear here.
              </p>
            </Card>
          )}
          {!loading &&
            bookings.map((b) => (
              <Card key={b.ref} className="p-5 card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {b.ref}
                      </span>
                      {b.isRoundTrip && (
                        <Badge variant="outline" className="text-primary font-bold">
                          Round-trip
                        </Badge>
                      )}
                      <Badge
                        variant={
                          b.status === "Confirmed" ? "default" : "destructive"
                        }
                      >
                        {b.status}
                      </Badge>
                      <Badge variant="outline">{b.paymentStatus}</Badge>
                    </div>

                    {/* Outbound leg */}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Bus className="h-4 w-4 text-primary" />
                        {b.company} · {b.busName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {b.from} → {b.to}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {b.date} · {b.departureTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        Seats {b.seats.join(", ")}
                      </span>
                    </div>

                    {/* Return leg if round trip */}
                    {b.isRoundTrip && b.returnFrom && (
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-t pt-2">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <ArrowLeftRight className="h-4 w-4 text-primary" />
                          Return: {b.returnCompany || b.company}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {b.returnFrom} → {b.returnTo}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {b.returnDate} · {b.returnDepartureTime || ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          Seats {b.returnSeats?.join(", ") || "Selected"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetail(b)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" /> Invoice
                    </Button>
                    {b.status === "Confirmed" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancel(b.ref)}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking {detail?.ref}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="border-b pb-2 space-y-1.5">
                <p className="font-semibold text-primary">Passenger</p>
                <Row label="Name" value={detail.passenger.fullName} />
                <Row label="Email" value={detail.passenger.email} />
                <Row label="Phone" value={detail.passenger.phone} />
              </div>

              <div className="border-b pb-2 space-y-1.5">
                <p className="font-semibold text-primary">1. Departure Ticket</p>
                <Row
                  label="Bus"
                  value={`${detail.company} · ${detail.busName}`}
                />
                <Row label="Route" value={`${detail.from} → ${detail.to}`} />
                <Row
                  label="Departure"
                  value={`${detail.date} · ${detail.departureTime}`}
                />
                <Row label="Seats" value={detail.seats.join(", ")} />
              </div>

              {detail.isRoundTrip && detail.returnFrom && (
                <div className="border-b pb-2 space-y-1.5">
                  <p className="font-semibold text-primary">2. Return Ticket</p>
                  <Row
                    label="Bus"
                    value={`${detail.returnCompany || detail.company} · ${detail.returnBusName || detail.busName}`}
                  />
                  <Row
                    label="Route"
                    value={`${detail.returnFrom} → ${detail.returnTo}`}
                  />
                  <Row
                    label="Departure"
                    value={`${detail.returnDate} · ${detail.returnDepartureTime || ""}`}
                  />
                  <Row
                    label="Seats"
                    value={detail.returnSeats?.join(", ") || "Selected"}
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <Row
                  label="Payment"
                  value={`${detail.paymentMethod} · ${detail.paymentStatus}`}
                />
                <Row label="Total Paid" value={`$${detail.total.toFixed(2)}`} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

