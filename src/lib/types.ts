export type Role = "owner" | "employee";

export type VehicleTypeName = "Bike" | "Cycle" | "Car";

export interface RateSlab {
  order: number;
  fromHour: number;
  toHour: number | null; // null = unbounded ("and beyond")
  amount: number;
  type: "flat" | "per_hour";
}

export interface VehicleType {
  id: string;
  name: VehicleTypeName;
  slabs: RateSlab[];
}

export type PaymentMode = "cash" | "gpay";

export type SessionStatus = "parked" | "completed";

export interface ParkingSession {
  id: string;
  tokenCode: string;
  vehicleTypeId: string;
  vehicleNumber?: string;
  entryTime: string; // ISO
  exitTime?: string; // ISO
  amountCharged?: number;
  paymentMode?: PaymentMode;
  recordedBy: string;
  status: SessionStatus;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  expenseDate: string; // ISO
  recordedBy: string;
}
