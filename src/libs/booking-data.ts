export type BusType = "VIP 2-2" | "VIP 2-1" | "Sleeper";

export interface Trip {
  id: string;
  company: string;
  busName: string;
  busType: BusType;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  amenities: string[];
  bookedSeats: string[];
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
    id: "TR001",
    company: "Giant Ibis",
    busName: "Express 01",
    busType: "VIP 2-2",
    from: "Phnom Penh",
    to: "Siem Reap",
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
    id: "TR002",
    company: "Mekong Express",
    busName: "Sleeper Deluxe",
    busType: "Sleeper",
    from: "Phnom Penh",
    to: "Siem Reap",
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
    id: "TR003",
    company: "Virak Buntham",
    busName: "Comfort Line",
    busType: "VIP 2-1",
    from: "Phnom Penh",
    to: "Sihanoukville",
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
    id: "TR004",
    company: "Giant Ibis",
    busName: "Night Rider",
    busType: "VIP 2-2",
    from: "Phnom Penh",
    to: "Sihanoukville",
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
    id: "TR005",
    company: "Mekong Express",
    busName: "Highway King",
    busType: "VIP 2-1",
    from: "Siem Reap",
    to: "Battambang",
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

export function searchTrips(from?: string, to?: string) {
  return TRIPS.filter(
    (t) => (!from || t.from === from) && (!to || t.to === to),
  );
}

export function getTrip(id: string) {
  return TRIPS.find((t) => t.id === id);
}

// Booking flow state (session-persisted)
export interface BookingDraft {
  tripId: string;
  date: string;
  selectedSeats: string[];
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

// My bookings (localStorage)
export interface Booking {
  ref: string;
  tripId: string;
  company: string;
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
}

const BKEY = "bus_bookings";
export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const v = localStorage.getItem(BKEY);
  return v ? JSON.parse(v) : [];
}
export function saveBooking(b: Booking) {
  const list = getBookings();
  list.unshift(b);
  localStorage.setItem(BKEY, JSON.stringify(list));
}
export function updateBooking(ref: string, patch: Partial<Booking>) {
  const list = getBookings().map((b) =>
    b.ref === ref ? { ...b, ...patch } : b,
  );
  localStorage.setItem(BKEY, JSON.stringify(list));
}
