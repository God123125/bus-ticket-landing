import type { BusType } from "@/lib/booking-data";

interface Props {
  busType: BusType;
  bookedSeats: string[];
  seatHolds?: string[];
  selected: string[];
  onToggle: (seat: string) => void;
}

// Generate a layout: rows of seats. Each seat has an id like "1A".
export function generateLayout(busType: BusType) {
  if (busType === "VIP 2-2") {
    // 10 rows, 4 seats (A B | C D)
    return Array.from({ length: 10 }, (_, r) => ({
      row: r + 1,
      left: [`${r + 1}A`, `${r + 1}B`],
      right: [`${r + 1}C`, `${r + 1}D`],
    }));
  }
  if (busType === "VIP 2-1") {
    // 9 rows, 3 seats (A B | C)
    return Array.from({ length: 9 }, (_, r) => ({
      row: r + 1,
      left: [`${r + 1}A`, `${r + 1}B`],
      right: [`${r + 1}C`],
    }));
  }
  // Sleeper: 10 rows, 3 (A B | C)
  return Array.from({ length: 10 }, (_, r) => ({
    row: r + 1,
    left: [`${r + 1}A`, `${r + 1}B`],
    right: [`${r + 1}C`],
  }));
}

// Normalize booked seat ids from data (e.g., "A1") to our format ("1A")
function normalize(s: string) {
  const m = s.match(/^([A-Z])(\d+)$/);
  if (m) return `${m[2]}${m[1]}`;
  return s;
}

export function SeatMap({
  busType,
  bookedSeats,
  seatHolds = [],
  selected,
  onToggle,
}: Props) {
  const rows = generateLayout(busType);
  const booked = new Set(bookedSeats.map(normalize));
  const held = new Set(seatHolds.map(normalize));

  const stateOf = (s: string) =>
    booked.has(s)
      ? "booked"
      : held.has(s)
        ? "held"
        : selected.includes(s)
          ? "selected"
          : "available";

  return (
    <div className="mx-auto w-fit">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        {/* Steering wheel / driver area */}
        <div className="mb-5 flex items-center justify-start">
          <SteeringWheel />
        </div>

        <div className="space-y-2.5">
          {rows.map((r) => (
            <div
              key={r.row}
              className="grid grid-cols-[auto_2rem_auto] items-center"
            >
              <div className="flex gap-2.5">
                {r.left.map((s) => (
                  <Seat
                    key={s}
                    id={s}
                    state={stateOf(s)}
                    onClick={() => onToggle(s)}
                  />
                ))}
              </div>
              <div
                aria-hidden
                className="text-center text-[10px] text-muted-foreground/50"
              >
                {r.row}
              </div>
              <div className="flex justify-end gap-2.5">
                {r.right.map((s) => (
                  <Seat
                    key={s}
                    id={s}
                    state={stateOf(s)}
                    onClick={() => onToggle(s)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs">
        <LegendItem state="available" label="Available" />
        <LegendItem state="selected" label="Selected" />
        <LegendItem state="held" label="On Hold" />
        <LegendItem state="booked" label="Booked" />
      </div>
    </div>
  );
}

type SeatState = "available" | "booked" | "selected" | "held";

function SeatShape({
  state,
  label,
  size = "h-11 w-11",
}: {
  state: SeatState;
  label?: string;
  size?: string;
}) {
  const tone = {
    available: "text-primary/60",
    selected: "text-primary",
    booked: "text-muted-foreground/40",
    held: "text-amber-500/50 dark:text-amber-400/40",
  }[state];
  const fill = {
    available: "fill-transparent",
    selected: "fill-primary",
    booked: "fill-muted",
    held: "fill-amber-500/15 dark:fill-amber-400/10",
  }[state];
  const text = {
    available: "text-foreground/70",
    selected: "text-primary-foreground",
    booked: "text-muted-foreground",
    held: "text-muted-foreground/70",
  }[state];

  return (
    <span
      className={`relative block ${size} ${state === "held" ? "filter blur-[0.5px] opacity-60" : ""}`}
    >
      <svg viewBox="0 0 44 44" className={`h-full w-full ${tone}`} aria-hidden>
        {/* backrest + cushion */}
        <rect
          x="9"
          y="5"
          width="26"
          height="34"
          rx="7"
          className={fill}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={state === "held" ? "3 3" : undefined}
        />
        {/* armrests */}
        <rect
          x="2.5"
          y="14"
          width="6"
          height="18"
          rx="3"
          className={fill}
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="35.5"
          y="14"
          width="6"
          height="18"
          rx="3"
          className={fill}
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span
        className={`absolute inset-0 grid place-items-center pt-0.5 text-[10px] font-semibold ${text}`}
      >
        {label}
      </span>
    </span>
  );
}

function Seat({
  id,
  state,
  onClick,
}: {
  id: string;
  state: SeatState;
  onClick: () => void;
}) {
  const isBlocked = state === "booked" || state === "held";

  return (
    <button
      type="button"
      disabled={isBlocked}
      onClick={onClick}
      aria-label={`Seat ${id} ${state === "held" ? "on hold" : state}`}
      aria-pressed={state === "selected"}
      title={state === "held" ? `Seat ${id} is currently on hold` : undefined}
      className={`rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
        isBlocked
          ? "cursor-not-allowed"
          : "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.06] active:scale-95"
      }`}
    >
      <SeatShape state={state} label={id} />
    </button>
  );
}

function LegendItem({ state, label }: { state: SeatState; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <SeatShape state={state} size="h-7 w-7" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function SteeringWheel() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 text-primary/80" aria-hidden>
      {/* outer rim with a subtle double ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
      />

      {/* three spokes */}
      <path
        d="M32 32L32 12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 32L49 42"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 32L15 42"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* center hub */}
      <circle
        cx="32"
        cy="32"
        r="8"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" />

      {/* grip texture marks */}
      <circle cx="32" cy="8" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="51" cy="44" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="13" cy="44" r="1.5" fill="currentColor" opacity="0.7" />

      {/* small dash indicator */}
      <path
        d="M32 4v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
