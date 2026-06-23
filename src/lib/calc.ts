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
      amount += Math.ceil(slabHours) * slab.amount;
    }
    if (slab.toHour !== null && hours <= slab.toHour) break;
  }
  return amount;
}
