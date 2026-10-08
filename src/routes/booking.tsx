import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Bus,
  Calendar,
  Download,
  Eye,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Star,
  Ticket,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getBookings, updateBooking, type Booking } from "@/lib/booking-data";
import { downloadBookingInvoice } from "@/lib/invoice";
import { apiClient } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/booking")({ component: BookingsPage });

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Booking | null>(null);

  // Feedback modal state
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [feedbackPreview, setFeedbackPreview] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setBookings(getBookings());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const openFeedbackDialog = (booking: Booking) => {
    setFeedbackBooking(booking);
    setFeedbackRating(5);
    setHoverRating(null);
    setFeedbackMessage("");
    setFeedbackFile(null);
    setFeedbackPreview(null);
  };

  const closeFeedbackDialog = () => {
    if (submittingFeedback) return;
    setFeedbackBooking(null);
    setFeedbackFile(null);
    setFeedbackPreview(null);
    setFeedbackMessage("");
    setFeedbackRating(5);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFeedbackFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFeedbackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFeedbackFile(null);
    setFeedbackPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBooking) return;

    if (!feedbackMessage.trim()) {
      toast.error("Please write your feedback message");
      return;
    }

    if (feedbackRating < 1 || feedbackRating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    const companyId = feedbackBooking.companyId;

    setSubmittingFeedback(true);
    try {
      if (feedbackFile) {
        const formData = new FormData();
        formData.append("company", companyId as string);
        formData.append("message", feedbackMessage.trim());
        formData.append("star", String(feedbackRating));
        formData.append("image", feedbackFile);
        await apiClient.post("/api/feedbacks", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await apiClient.post("/api/feedbacks", {
          company: companyId,
          message: feedbackMessage.trim(),
          star: feedbackRating,
        });
      }

      // Mark feedback as submitted in localStorage
      updateBooking(feedbackBooking.booking_code, { hasFeedback: true });
      setBookings(getBookings());
      toast.success("Thank you! Your feedback has been submitted.");
      closeFeedbackDialog();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit feedback. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmittingFeedback(false);
    }
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
              <Card key={b.booking_code} className="p-5 card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {b.booking_code}
                      </span>
                      {b.isRoundTrip && (
                        <Badge
                          variant="outline"
                          className="text-primary font-bold"
                        >
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
                      {b.hasFeedback && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200"
                        >
                          Feedback Given
                        </Badge>
                      )}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBookingInvoice(b)}
                    >
                      <Download className="mr-1 h-4 w-4" /> Invoice
                    </Button>
                    <Button
                      size="sm"
                      variant={b.hasFeedback ? "secondary" : "default"}
                      disabled={b.hasFeedback}
                      onClick={() => openFeedbackDialog(b)}
                      className={
                        b.hasFeedback
                          ? "opacity-60 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }
                    >
                      <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                      {b.hasFeedback ? "Feedback Sent" : "Give Feedback"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking {detail?.booking_code}</DialogTitle>
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
                <p className="font-semibold text-primary">
                  1. Departure Ticket
                </p>
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
          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (detail) downloadBookingInvoice(detail);
              }}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
            <Button size="sm" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give Feedback Dialog */}
      <Dialog
        open={!!feedbackBooking}
        onOpenChange={(open) => !open && closeFeedbackDialog()}
      >
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <MessageSquarePlus className="h-5 w-5 text-emerald-600" />
              Rate & Give Feedback
            </DialogTitle>
            <DialogDescription>
              Share your experience traveling with{" "}
              <span className="font-semibold text-foreground">
                {feedbackBooking?.company}
              </span>{" "}
              (Trip {feedbackBooking?.booking_code})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitFeedback} className="space-y-5 pt-2">
            {/* Star Rating Section */}
            <div>
              <Label className="block text-sm font-semibold text-foreground mb-2">
                Your Rating
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    (hoverRating !== null ? hoverRating : feedbackRating) >=
                    star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted stroke-[1.5]"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {feedbackRating === 5 && "⭐ Excellent"}
                  {feedbackRating === 4 && "👍 Very Good"}
                  {feedbackRating === 3 && "👌 Good"}
                  {feedbackRating === 2 && "😐 Fair"}
                  {feedbackRating === 1 && "👎 Poor"}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div>
              <Label
                htmlFor="feedback-message"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Feedback Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback-message"
                rows={4}
                required
                placeholder="Tell us what you liked or how we can improve the service..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="resize-none rounded-xl text-sm"
              />
            </div>

            {/* Photo Upload Section */}
            <div>
              <Label className="block text-sm font-semibold text-foreground mb-1.5">
                Add a Photo (Optional)
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {!feedbackPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-emerald-500/70 hover:bg-emerald-50/20 transition-all text-center group"
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-emerald-600 transition-colors mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    Click to upload a picture
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG or WEBP up to 5MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/40 p-2 flex items-center gap-3">
                  <img
                    src={feedbackPreview}
                    alt="Feedback upload preview"
                    className="h-16 w-16 object-cover rounded-lg border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate text-foreground">
                      {feedbackFile?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {feedbackFile
                        ? (feedbackFile.size / 1024).toFixed(1) + " KB"
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeFeedbackDialog}
                disabled={submittingFeedback}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingFeedback || !feedbackMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </DialogFooter>
          </form>
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
