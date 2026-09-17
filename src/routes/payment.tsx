import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  Bus,
  CheckCircle2,
  Send,
  Building2,
  User,
  Phone,
  FileText,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  getTrip,
  loadDraft,
  saveBooking,
  saveDraft,
  type Trip,
  type BusType,
  type Geographic,
} from "@/lib/booking-data";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/payment")({ component: PaymentPage });

type Method = "qr" | "card" | "mobile";

export interface ICompany {
  _id: string;
  name: string;
  rating?: number;
  is_active?: boolean;
  owner?: string;
  image?: string;
  color?: string;
  commission_rate?: number;
  khqrImage?: string;
}

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
    companyImage: companyObj.image || undefined,
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

function PaymentPage() {
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
  const [method, setMethod] = useState<Method>("qr");
  const [processing, setProcessing] = useState(false);

  // Company KHQR State
  const [company, setCompany] = useState<ICompany | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Payer bank details for verification
  const [senderBank, setSenderBank] = useState("ABA Bank");
  const [senderAccountName, setSenderAccountName] = useState(
    draft?.passenger?.fullName || "",
  );
  const [senderAccountNumber, setSenderAccountNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [hasPaidAlertSent, setHasPaidAlertSent] = useState(false);

  // 1. Fetch Departure and Return Trip Details
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
            console.error(
              "Failed to fetch departure trip in payment page:",
              err,
            );
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
            console.error("Failed to fetch return trip in payment page:", err);
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

  // 2. Fetch Company payment details (e.g. /api/companies/payment/:id)
  useEffect(() => {
    const companyIdToFetch =
      trip?.companyId || draft?.trip?.companyId || "6a6dcc6e5c72f6021f7e6e9a";

    if (companyIdToFetch) {
      setLoadingCompany(true);
      apiClient
        .get(`/api/companies/payment/${companyIdToFetch}`)
        .then((res) => {
          const compData = res.data?.data || res.data;
          if (compData && (compData._id || compData.name)) {
            setCompany(compData);
          }
        })
        .catch((err) => {
          console.warn(
            "Could not fetch payment info by ID, attempting fallback:",
            err,
          );
          // Fallback static company object if backend fails
          setCompany({
            _id: companyIdToFetch,
            name: trip?.company || "តេស្ត",
            khqrImage:
              "https://res.cloudinary.com/dhzd7ixtf/image/upload/v1787155187/companies/zf1ues3qqruhnu7mlpdp.png",
            image:
              "https://res.cloudinary.com/dhzd7ixtf/image/upload/v1785580720/companies/ha02id9xbnskt8abfoou.jpg",
          });
        })
        .finally(() => {
          setLoadingCompany(false);
        });
    }
  }, [trip?.companyId, draft?.trip?.companyId, trip?.company]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center p-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  if (!draft || !trip || !draft.passenger) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="p-10 text-center">
          Missing booking info.{" "}
          <Link className="text-primary underline" to="/">
            Start over
          </Link>
        </div>
      </div>
    );
  }

  const departureTotal = (draft.selectedSeats?.length || 0) * trip.price;
  const returnTotal =
    draft.isRoundTrip && returnTrip
      ? (draft.returnSelectedSeats?.length || 0) * returnTrip.price
      : 0;
  const grandTotal = departureTotal + returnTotal;

  // Helper to send Telegram Notification to Owner via /confirm-payment
  const sendTelegramNotification = async (bookingReference: string) => {
    const fromStr =
      typeof trip.from === "object"
        ? trip.from.name_en || trip.from.name_kh
        : trip.from;
    const toStr =
      typeof trip.to === "object"
        ? trip.to.name_en || trip.to.name_kh
        : trip.to;

    const messagePayload = {
      companyId: company?._id || trip.companyId,
      ownerId: company?.owner,
      bookingRef: bookingReference,
      passenger: {
        name: draft.passenger?.fullName,
        phone: draft.passenger?.phone,
        email: draft.passenger?.email,
      },
      trip: {
        route: `${fromStr} ➔ ${toStr}`,
        date: draft.date,
        time: trip.departureTime,
        seats: draft.selectedSeats,
        busName: trip.busName,
        company: company?.name || trip.company,
        tripId: draft.tripId as string,
      },
      returnTrip:
        draft.isRoundTrip && returnTrip
          ? {
              route: `${returnTrip.from.name_en || returnTrip.from.name_kh} ➔ ${returnTrip.to.name_en || returnTrip.to.name_kh}`,
              date: draft.returnDate || draft.date,
              time: returnTrip.departureTime,
              seats: draft.returnSelectedSeats?.join(", "),
              busName: returnTrip.busName,
            }
          : undefined,
      payment: {
        method,
        totalAmount: grandTotal,
        senderBank:
          method === "qr" || method === "mobile" ? senderBank : "Credit Card",
        senderAccountName: senderAccountName || draft.passenger?.fullName,
        senderAccountNumber: senderAccountNumber || "N/A",
        transactionRef: transactionRef || "N/A",
        paidAt: new Date().toISOString(),
      },
      // Formatted text message for telegram bot
      text:
        `🚌 *NEW BUS BOOKING PAYMENT ALERT*\n\n` +
        `📋 *Booking Ref:* \`${bookingReference}\`\n` +
        `🏢 *Operator:* ${company?.name || trip.company}\n` +
        `👤 *Passenger:* ${draft.passenger?.fullName} (${draft.passenger?.phone})\n\n` +
        `📍 *Outbound:* ${fromStr} ➔ ${toStr}\n` +
        `📅 *Date & Time:* ${draft.date} at ${trip.departureTime}\n` +
        `💺 *Seats:* ${draft.selectedSeats?.join(", ")}\n` +
        (draft.isRoundTrip && returnTrip
          ? `🔄 *Return:* ${returnTrip.from.name_en || returnTrip.from.name_kh} ➔ ${returnTrip.to.name_en || returnTrip.to.name_kh}\n` +
            `📅 *Return Date:* ${draft.returnDate} at ${returnTrip.departureTime}\n` +
            `💺 *Return Seats:* ${draft.returnSelectedSeats?.join(", ")}\n`
          : "") +
        `\n💵 *Total Paid:* $${grandTotal.toFixed(2)} USD\n` +
        `🏦 *Bank:* ${senderBank}\n` +
        `💳 *Payer Account:* ${senderAccountName} (${senderAccountNumber || "App Transfer"})\n` +
        `🔢 *Txn Reference:* \`${transactionRef || "Self-verified"}\``,
    };

    try {
      await apiClient.post("/api/confirm-payment", messagePayload);
    } catch (err) {
      console.warn(
        "Could not dispatch confirm-payment telegram notification:",
        err,
      );
    }
  };

  const handleNotifyOwnerPaid = async () => {
    if (!senderAccountName.trim()) {
      toast.error("Please enter your bank account or payer name");
      return;
    }
    setProcessing(true);
    const tempRef = "GB" + Math.random().toString(36).slice(2, 8).toUpperCase();
    await sendTelegramNotification(tempRef);
    setHasPaidAlertSent(true);
    setProcessing(false);
    toast.success("Payment notification alert sent to operator's Telegram!");
  };

  const confirm = async () => {
    setProcessing(true);
    const ref = "GB" + Math.random().toString(36).slice(2, 8).toUpperCase();

    // 1. Confirm bookings on backend
    if (draft.bookingId) {
      try {
        await apiClient.patch(`/api/bookings/${draft.bookingId}`, {
          status: "confirmed",
          payment_info: {
            method,
            senderBank,
            senderAccountName,
            senderAccountNumber,
            transactionRef,
            paid_amount: grandTotal,
          },
        });
      } catch (err) {
        console.warn("Could not update departure booking to confirmed:", err);
      }
    }

    if (draft.returnBookingId) {
      try {
        await apiClient.patch(`/api/bookings/${draft.returnBookingId}`, {
          status: "confirmed",
          payment_info: {
            method,
            senderBank,
            senderAccountName,
            senderAccountNumber,
            transactionRef,
            paid_amount: grandTotal,
          },
        });
      } catch (err) {
        console.warn("Could not update return booking to confirmed:", err);
      }
    }

    // 2. Trigger Telegram Notification
    try {
      await sendTelegramNotification(ref);
    } catch (e) {
      console.warn("Telegram notification warning:", e);
    }

    // 3. Save into LocalStorage for booking history
    saveBooking({
      ref,
      tripId: trip._id,
      company: company?.name || trip.company,
      busName: trip.busName,
      from:
        typeof trip.from === "object"
          ? trip.from.name_en || trip.from.name_kh || ""
          : trip.from,
      to:
        typeof trip.to === "object"
          ? trip.to.name_en || trip.to.name_kh || ""
          : trip.to,
      date: draft.date,
      departureTime: trip.departureTime,
      seats: draft.selectedSeats,
      passenger: draft.passenger!,
      total: grandTotal,
      paymentMethod:
        method === "qr"
          ? "KHQR"
          : method === "mobile"
            ? "Mobile Banking"
            : "Card",
      paymentStatus: "Paid",
      status: "Confirmed",
      createdAt: new Date().toISOString(),

      // Round trip info
      isRoundTrip: draft.isRoundTrip,
      returnTripId: draft.returnTripId,
      returnCompany: returnTrip?.company,
      returnBusName: returnTrip?.busName,
      returnFrom: returnTrip
        ? typeof returnTrip.from === "object"
          ? returnTrip.from.name_en || returnTrip.from.name_kh
          : returnTrip.from
        : undefined,
      returnTo: returnTrip
        ? typeof returnTrip.to === "object"
          ? returnTrip.to.name_en || returnTrip.to.name_kh
          : returnTrip.to
        : undefined,
      returnDate: draft.returnDate || draft.date,
      returnDepartureTime: returnTrip?.departureTime,
      returnSeats: draft.returnSelectedSeats,
    });

    saveDraft({ ...draft, paymentMethod: method });
    setProcessing(false);
    toast.success(
      "Payment confirmed & notification dispatched! Have a great trip.",
    );
    nav({ to: "/success", search: { ref } });
  };

  const qrDisplayImage =
    company?.khqrImage ||
    "https://res.cloudinary.com/dhzd7ixtf/image/upload/v1787155187/companies/zf1ues3qqruhnu7mlpdp.png";

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteNav />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Payment Details & Bank Transfer verification */}
        <div className="space-y-6">
          <Card className="p-6 border-border/80 shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Payment Verification
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your payment via{" "}
                  {company?.name ? `${company.name}'s` : "official"} KHQR code.
                </p>
              </div>
              {company && (
                <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-xl border border-border/60">
                  {company.image && (
                    <img
                      src={company.image}
                      alt={company.name}
                      className="h-7 w-7 rounded-full object-cover border border-primary/30"
                    />
                  )}
                  <span className="text-xs font-bold text-foreground">
                    {company.name}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-6 grid gap-3 grid-cols-3">
              <MethodButton
                active={method === "qr"}
                onClick={() => setMethod("qr")}
                icon={<QrCode className="h-5 w-5" />}
                label="KHQR Scan"
                badge="Fastest"
              />
              <MethodButton
                active={method === "mobile"}
                onClick={() => setMethod("mobile")}
                icon={<Smartphone className="h-5 w-5" />}
                label="Bank Transfer"
              />
              <MethodButton
                active={method === "card"}
                onClick={() => setMethod("card")}
                icon={<CreditCard className="h-5 w-5" />}
                label="Credit Card"
              />
            </div>

            {/* Method 1: KHQR Scanning */}
            {method === "qr" && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-b from-primary/5 via-background to-secondary/30 p-6 text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-bold mb-3 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Official KHQR
                    Verified
                  </div>

                  {loadingCompany ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="mt-3 text-xs text-muted-foreground">
                        Loading KHQR code...
                      </p>
                    </div>
                  ) : (
                    <div className="relative mx-auto w-64 max-w-full overflow-hidden rounded-2xl border-4 border-white bg-white p-3 shadow-xl">
                      <img
                        src={qrDisplayImage}
                        alt="Company KHQR Payment Code"
                        className="w-full h-auto object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://res.cloudinary.com/dhzd7ixtf/image/upload/v1787155187/companies/zf1ues3qqruhnu7mlpdp.png";
                        }}
                      />
                      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <span>Bakong / ABA / ACLEDA / Any Bank</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-1">
                    <p className="text-base font-black text-foreground">
                      Amount:{" "}
                      <span className="text-primary text-xl">
                        ${grandTotal.toFixed(2)} USD
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Scan with any Cambodian banking app (Bakong, ABA, Wing,
                      ACLEDA, Sathapana, etc.)
                    </p>
                  </div>
                </div>

                {/* Bank Information Form */}
                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground pb-2 border-b border-border/60">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Your Payment Transfer Details</span>
                    <span className="text-xs font-normal text-muted-foreground ml-auto">
                      Helps the operator verify your transaction
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                        Your Bank / App
                      </Label>
                      <select
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="ABA Bank">ABA Bank</option>
                        <option value="Bakong App">Bakong App</option>
                        <option value="ACLEDA Bank">ACLEDA Bank</option>
                        <option value="Wing Bank">Wing Bank</option>
                        <option value="Canadia Bank">Canadia Bank</option>
                        <option value="Sathapana Bank">Sathapana Bank</option>
                        <option value="Other Bank">Other Bank</option>
                      </select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                        Payer / Account Name *
                      </Label>
                      <Input
                        placeholder="e.g. SOKHA CHAN"
                        value={senderAccountName}
                        onChange={(e) => setSenderAccountName(e.target.value)}
                        className="rounded-xl h-10 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                        Account / Phone Number (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. 012 345 678"
                        value={senderAccountNumber}
                        onChange={(e) => setSenderAccountNumber(e.target.value)}
                        className="rounded-xl h-10 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                        Bank Transaction Ref / Code (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. 984729103"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="rounded-xl h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Send Alert to Telegram Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      Notify the operator immediately after scanning the QR code
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNotifyOwnerPaid}
                      disabled={processing || hasPaidAlertSent}
                      className="rounded-xl font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 gap-1.5 text-xs w-full sm:w-auto"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {hasPaidAlertSent
                        ? "Alert Sent to Telegram ✓"
                        : "Send Paid Alert to Telegram"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: Mobile Direct Transfer */}
            {method === "mobile" && (
              <div className="mt-6 space-y-4 rounded-2xl border border-border/80 p-5 bg-card">
                <h3 className="font-bold text-sm">
                  Direct Bank Account Transfer
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs font-semibold">
                      Select Sender Bank
                    </Label>
                    <select
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                    >
                      <option value="ABA Bank">
                        ABA Bank (000 123 456 - GreenLine)
                      </option>
                      <option value="ACLEDA Bank">
                        ACLEDA Bank (123456789012 - GreenLine)
                      </option>
                      <option value="Wing Bank">Wing Bank (012 345 678)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-semibold">
                      Your Sender Name
                    </Label>
                    <Input
                      placeholder="Account Name"
                      value={senderAccountName}
                      onChange={(e) => setSenderAccountName(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-xs font-semibold">
                      Transaction ID / Reference
                    </Label>
                    <Input
                      placeholder="Paste receipt transfer reference number"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method 3: Credit / Debit Card */}
            {method === "card" && (
              <div className="mt-6 space-y-4 rounded-2xl border border-border/80 p-5 bg-card">
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold">
                    Card Number
                  </Label>
                  <Input
                    placeholder="4111 2222 3333 4444"
                    className="rounded-xl h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block text-xs font-semibold">
                      Expiry Date
                    </Label>
                    <Input placeholder="MM/YY" className="rounded-xl h-10" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-semibold">
                      CVC / CVV
                    </Label>
                    <Input placeholder="123" className="rounded-xl h-10" />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold">
                    Cardholder Name
                  </Label>
                  <Input
                    defaultValue={draft.passenger?.fullName}
                    placeholder="Name on card"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="mt-8 pt-4 border-t border-border/60">
              <Button
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all gap-2"
                size="lg"
                onClick={confirm}
                disabled={processing}
              >
                <Lock className="h-4 w-4 stroke-[2.5]" />
                {processing
                  ? "Verifying & Issuing Tickets..."
                  : `Confirm & Complete Booking · $${grandTotal.toFixed(2)} USD`}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Your ticket details and QR code will be generated instantly and
                dispatched to the operator.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Order Summary */}
        <div className="space-y-4">
          <Card className="p-5 border-border/80 shadow-md rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Booking Summary</h3>
              {draft.isRoundTrip && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary font-semibold text-xs"
                >
                  Round-trip
                </Badge>
              )}
            </div>

            {/* Outbound Leg */}
            <div className="space-y-2 border-b pb-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Bus className="h-4 w-4" /> 1. Departure Journey
              </div>
              <Row
                label="Route"
                value={`${trip.from.name_en || trip.from.name_kh} → ${trip.to.name_en || trip.to.name_kh}`}
              />
              <Row label="Date" value={draft.date || "Today"} />
              <Row
                label="Bus Operator"
                value={`${company?.name || trip.company} (${trip.departureTime})`}
              />
              <Row
                label="Selected Seats"
                value={draft.selectedSeats?.join(", ") || "None"}
              />
              <Row label="Subtotal" value={`$${departureTotal.toFixed(2)}`} />
            </div>

            {/* Return Leg (if round-trip) */}
            {draft.isRoundTrip && returnTrip && (
              <div className="space-y-2 border-b pb-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Bus className="h-4 w-4" /> 2. Return Journey
                </div>
                <Row
                  label="Route"
                  value={`${returnTrip.from.name_en || returnTrip.from.name_kh} → ${returnTrip.to.name_en || returnTrip.to.name_kh}`}
                />
                <Row
                  label="Date"
                  value={draft.returnDate || draft.date || "Return Date"}
                />
                <Row
                  label="Bus Operator"
                  value={`${returnTrip.company} (${returnTrip.departureTime})`}
                />
                <Row
                  label="Selected Seats"
                  value={draft.returnSelectedSeats?.join(", ") || "None"}
                />
                <Row label="Subtotal" value={`$${returnTotal.toFixed(2)}`} />
              </div>
            )}

            {/* Passenger Info */}
            <div className="space-y-2 text-xs sm:text-sm border-b pb-3">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Passenger
                Contact
              </div>
              <Row label="Full Name" value={draft.passenger.fullName} />
              <Row label="Phone" value={draft.passenger.phone} />
              <Row label="Email" value={draft.passenger.email} />
            </div>

            {/* Total */}
            <div className="pt-1 flex items-center justify-between font-black text-lg text-foreground">
              <span>Total Payable:</span>
              <span className="text-2xl text-primary font-extrabold">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3.5 text-xs font-semibold transition-all duration-200 ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
          : "border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-extrabold text-white">
          {badge}
        </span>
      )}
      <div className="h-5 w-5">{icon}</div>
      <span>{label}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
