import { VehicleType } from "./types";

export function durationHours(entryTime: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(entryTime).getTime();
  return Math.max(ms / (1000 * 60 * 60), 0);
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// The business operates in India — "today" and "this month" must mean the
// IST calendar date, not whatever timezone the browser or server happens to
// be running in (Vercel's servers run in UTC, which can silently shift day
// boundaries by hours depending on time of day).
const IST_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function getISTDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = IST_PARTS_FORMATTER.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function isSameDay(iso: string, reference: Date): boolean {
  const a = getISTDateParts(new Date(iso));
  const b = getISTDateParts(reference);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameMonth(iso: string, reference: Date): boolean {
  const a = getISTDateParts(new Date(iso));
  const b = getISTDateParts(reference);
  return a.year === b.year && a.month === b.month;
}

export function isWithinRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export function daysUntil(iso: string, reference: Date = new Date()): number {
  const ms = new Date(iso).getTime() - reference.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function calculateAmount(vehicleType: VehicleType, hours: number): number {
  const sorted = [...vehicleType.slabs].sort((a, b) => a.order - b.order);
  const first = sorted[0];
  if (!first) return 0;

  if (hours <= first.toHour! || first.toHour === null) {
    return first.amount;
  }

  let amount = first.amount;
  const remaining = sorted.slice(1);
  for (const slab of remaining) {
    const slabHours =
      slab.toHour === null ? hours - slab.fromHour : Math.min(hours, slab.toHour) - slab.fromHour;
    if (slabHours <= 0) continue;
    if (slab.type === "flat") {
      amount += slab.amount;
    } else {
      const unit = slab.unitHours ?? 1;
      amount += Math.ceil(slabHours / unit) * slab.amount;
    }
    if (slab.toHour !== null && hours <= slab.toHour) break;
  }
  return amount;
}
