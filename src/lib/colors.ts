import { VehicleTypeName } from "./types";

// Picked for max separation in both hue AND lightness/saturation — two
// muted colors (e.g. purple + brown) can share enough tone to still look
// "the same" at a glance even with different hues. Blue / magenta / gold
// stay distinct even in small icon avatars.
export const VEHICLE_COLORS: Record<VehicleTypeName, string> = {
  Bike: "#1565C0",
  Cycle: "#C2185B",
  Car: "#B8860B",
};

export const CASH_COLOR = "#2E7D32";
export const ONLINE_COLOR = "#5E35B1";
