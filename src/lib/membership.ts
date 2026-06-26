import { MembershipPrice, VehicleType } from "./types";

export const MEMBERSHIP_DURATIONS = [1, 3, 6, 12];

export function durationLabel(months: number): string {
  return months === 1 ? "1 Month" : `${months} Months`;
}

export function getMembershipPrice(vehicleType: VehicleType, durationMonths: number): number {
  return vehicleType.membershipPricing.find((p) => p.durationMonths === durationMonths)?.price ?? 0;
}

export function defaultMembershipPricing(): MembershipPrice[] {
  return MEMBERSHIP_DURATIONS.map((durationMonths) => ({ durationMonths, price: 0 }));
}
