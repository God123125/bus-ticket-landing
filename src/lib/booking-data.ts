export type BusType = "VIP 2-2" | "VIP 2-1" | "Sleeper";

export interface Trip {
  _id: string;
  id?: string;
  companyId?: string;
  company: string;
  companyImage?: string;
  busImages?: string[];
  busName: string;
  busType: BusType;
  from: Geographic;
  to: Geographic;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  amenities: string[];
  bookedSeats: string[];
  seatHolds?: string[];
}
export interface Geographic {
  _id?: string;
  name_kh: string;
  name_en?: string;
}

export const CITIES = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampot",
  "Kep",
  "Bangkok",
  "Ho Chi Minh City",
];

export const TRIPS: Trip[] = [
  {
    _id: "TR001",
    company: "Giant Ibis",
    busName: "Express 01",
    busType: "VIP 2-2",
    from: {
      name_en: "Phnom Penh",
      name_kh: "ភ្នំពេញ",
    },
    to: {
      name_en: "Siem Reap",
      name_kh: "សៀមរាប",
    },
    departureTime: "07:30",
    arrivalTime: "13:00",
    duration: "5h 30m",
    availableSeats: 24,
    totalSeats: 40,
    price: 18,
    amenities: ["WiFi", "AC", "Water", "USB"],
    bookedSeats: [
      "A1",
      "A2",
      "B5",
      "C3",
      "D8",
      "E2",
      "F4",
      "G6",
      "H1",
      "H2",
      "I3",
      "J4",
      "K5",
      "L6",
      "M1",
      "M2",
    ],
  },
  {
    _id: "TR002",
    company: "Mekong Express",
    busName: "Sleeper Deluxe",
    busType: "Sleeper",
    from: {
      name_en: "Phnom Penh",
      name_kh: "ភ្នំពេញ",
    },
    to: {
      name_en: "Siem Reap",
      name_kh: "សៀមរាប",
    },
    departureTime: "22:00",
    arrivalTime: "05:30",
    duration: "7h 30m",
    availableSeats: 18,
    totalSeats: 30,
    price: 25,
    amenities: ["WiFi", "AC", "Blanket", "Snack"],
    bookedSeats: [
      "A1",
      "B2",
      "C3",
      "D4",
      "E5",
      "F1",
      "G2",
      "H3",
      "I4",
      "J5",
      "K1",
      "L2",
    ],
  },
  {
    _id: "TR003",
    company: "Virak Buntham",
    busName: "Comfort Line",
    busType: "VIP 2-1",
    from: {
      name_en: "Phnom Penh",
      name_kh: "ភ្នំពេញ",
    },
    to: {
      name_en: "Sihanoukville",
      name_kh: "ព្រះសីហនុ",
    },
    departureTime: "09:00",
    arrivalTime: "13:30",
    duration: "4h 30m",
    availableSeats: 12,
    totalSeats: 27,
    price: 15,
    amenities: ["AC", "Water"],
    bookedSeats: [
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "D1",
      "E1",
      "F1",
      "G1",
      "H1",
      "I1",
      "J1",
      "K1",
      "L1",
      "M1",
    ],
  },
  {
    _id: "TR004",
    company: "Giant Ibis",
    busName: "Night Rider",
    busType: "VIP 2-2",
    from: {
      name_en: "Phnom Penh",
      name_kh: "ភ្នំពេញ",
    },
    to: {
      name_en: "Sihanoukville",
      name_kh: "ព្រះសីហនុ",
    },
    departureTime: "23:30",
    arrivalTime: "04:30",
    duration: "5h 00m",
    availableSeats: 30,
    totalSeats: 40,
    price: 20,
    amenities: ["WiFi", "AC", "USB", "Blanket"],
    bookedSeats: ["A1", "B2", "C3", "D4", "E5", "F6", "G7", "H8", "I1", "J2"],
  },
  {
    _id: "TR005",
    company: "Mekong Express",
    busName: "Highway King",
    busType: "VIP 2-1",
    from: {
      name_en: "Siem Reap",
      name_kh: "សៀមរាប",
    },
    to: {
      name_en: "Battambang",
      name_kh: "បាត់ដំបង",
    },
    departureTime: "08:00",
    arrivalTime: "11:00",
    duration: "3h 00m",
    availableSeats: 20,
    totalSeats: 27,
    price: 12,
    amenities: ["AC", "Water", "WiFi"],
    bookedSeats: ["A1", "A2", "B1", "C1", "D1", "E1", "F1"],
  },
];

export function searchTrips(
  from?: string | Geographic,
  to?: string | Geographic,
) {
  const fromStr =
    typeof from === "object"
      ? from?.name_en || from?.name_kh || from?._id
      : from;
  const toStr =
    typeof to === "object" ? to?.name_en || to?.name_kh || to?._id : to;
  return TRIPS.filter(
    (t) =>
      (!fromStr ||
        t.from.name_en === fromStr ||
        t.from.name_kh === fromStr ||
        t.from._id === fromStr) &&
      (!toStr ||
        t.to.name_en === toStr ||
        t.to.name_kh === toStr ||
        t.to._id === toStr),
  );
}

export function getTrip(id: string) {
  return TRIPS.find((t) => t._id === id);
}

// Booking flow state (session-persisted)
export interface BookingDraft {
  bookingId?: string;
  tripId: string;
  date: string;
  selectedSeats: string[];
  trip?: Trip;

  // Search context
  from?: string | Geographic;
  to?: string | Geographic;
  schedule?: string;
  tripType?: "oneway" | "roundtrip";

  // Round trip support
  isRoundTrip?: boolean;
  returnTripId?: string;
  returnDate?: string;
  returnSelectedSeats?: string[];
  returnTrip?: Trip;
  returnBookingId?: string;

  passenger?: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  };
  paymentMethod?: string;
}

const KEY = "bus_booking_draft";
export function saveDraft(d: BookingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(d));
}
export function loadDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(KEY);
  return v ? JSON.parse(v) : null;
}
export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

// My bookings (localStorage stored reference)
export interface StoredBookingRef {
  booking_code: string;
  access_token?: string;
  hasFeedback?: boolean;
  paymentMethod?: string;
}

export interface Booking {
  access_token?: string;
  booking_code: string;
  tripId: string;
  company: {
    name: string;
    _id?: string;
  };
  busName: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  seats: string[];
  passenger: { fullName: string; phone: string; email: string };
  total: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending";
  status: "Confirmed" | "Cancelled";
  createdAt: string;

  // Round-trip support
  isRoundTrip?: boolean;
  returnTripId?: string;
  returnCompany?: string;
  returnCompanyId?: string;
  returnBusName?: string;
  returnFrom?: string;
  returnTo?: string;
  returnDate?: string;
  returnDepartureTime?: string;
  returnSeats?: string[];

  // Feedback tracking
  companyId?: string;
  hasFeedback?: boolean;
}

const BKEY = "bus_bookings";

export function getStoredBookingTokens(): StoredBookingRef[] {
  if (typeof window === "undefined") return [];
  const v = localStorage.getItem(BKEY);
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    if (!Array.isArray(parsed)) return [];
    
    const seen = new Set<string>();
    const result: StoredBookingRef[] = [];

    for (const item of parsed) {
      if (!item || !item.booking_code) continue;
      const token = item.access_token || item.accessToken || "";
      // If user is not logged in and item has no access_token, it cannot be queried from backend
      const userToken = localStorage.getItem("token");
      if (!token && !userToken) continue;

      if (!seen.has(item.booking_code)) {
        seen.add(item.booking_code);
        result.push({
          booking_code: item.booking_code,
          access_token: token,
          hasFeedback: Boolean(item.hasFeedback),
          paymentMethod: item.paymentMethod,
        });
      }
    }
    return result;
  } catch {
    return [];
  }
}

export function saveBookingToken(ref: StoredBookingRef) {
  if (typeof window === "undefined") return;
  const list = getStoredBookingTokens().filter(
    (item) => item.booking_code !== ref.booking_code,
  );
  list.unshift({
    booking_code: ref.booking_code,
    access_token: ref.access_token,
    hasFeedback: ref.hasFeedback,
    paymentMethod: ref.paymentMethod,
  });
  localStorage.setItem(BKEY, JSON.stringify(list));
}

export function updateStoredBookingToken(
  booking_code: string,
  patch: Partial<StoredBookingRef>,
) {
  if (typeof window === "undefined") return;
  const list = getStoredBookingTokens().map((b) =>
    b.booking_code === booking_code ? { ...b, ...patch } : b,
  );
  localStorage.setItem(BKEY, JSON.stringify(list));
}

// Kept for backward compatibility across existing calls
export function getBookings(): Booking[] {
  // Full booking objects are no longer kept in localStorage.
  // Use getStoredBookingTokens() and fetch from /api/bookings.
  return [];
}

export function saveBooking(b: Partial<Booking> & { booking_code: string }) {
  saveBookingToken({
    booking_code: b.booking_code,
    access_token: b.access_token,
    hasFeedback: b.hasFeedback,
    paymentMethod: b.paymentMethod,
  });
}

export function updateBooking(ref: string, patch: Partial<Booking>) {
  updateStoredBookingToken(ref, {
    hasFeedback: patch.hasFeedback,
    paymentMethod: patch.paymentMethod,
  });
}
