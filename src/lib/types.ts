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

export type PaymentMode = "cash" | "online";

export type SessionStatus = "parked" | "completed";

export interface ParkingSession {
  id: string;
  tokenCode: string;
  vehicleTypeId: string;
  vehicleNumber: string;
  entryTime: string; // ISO
  exitTime?: string; // ISO
  amountPaidAtEntry: number;
  paymentModeAtEntry?: PaymentMode; // set only if amountPaidAtEntry > 0
  amountPaidAtExit?: number;
  paymentModeAtExit?: PaymentMode;
  totalAmount?: number; // computed total cost, set once the vehicle exits
  recordedBy: string;
  status: SessionStatus;
}

export interface Expense {
  id: string;
  amount: number;
  title: string;
  note?: string;
  expenseDate: string; // ISO, defaults to today, editable within current month
  recordedBy: string;
}
