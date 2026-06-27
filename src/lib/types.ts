export type Role = "admin" | "employee";

export type Language = "en" | "ta";

export interface TeamInvite {
  id: string;
  name: string;
  phone: string;
  pin: string; // 4-digit — shared with the invitee in place of an OTP
  role: Role;
  createdAt: string; // ISO
}

export type VehicleNumberCaptureMode = "full" | "last4";

export type VehicleTypeName = "Bike" | "Cycle" | "Car";

export interface RateSlab {
  order: number;
  fromHour: number;
  toHour: number | null; // null = unbounded ("and beyond")
  amount: number;
  type: "flat" | "per_hour";
  unitHours?: number; // for "per_hour" slabs — bill `amount` per this many hours (default 1)
}

export interface MembershipPrice {
  durationMonths: number;
  price: number;
}

export interface Address {
  doorStreet?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

export const ID_PROOF_TYPES = ["Aadhaar", "Driving Licence", "Voter ID", "PAN Card", "Passport", "Other"] as const;
export type IdProofType = (typeof ID_PROOF_TYPES)[number];

export interface IdProof {
  type: IdProofType;
  number?: string;
  photoUrl?: string;
}

export interface VehicleType {
  id: string;
  name: VehicleTypeName;
  slabs: RateSlab[];
  totalSlots: number;
  membershipPricing: MembershipPrice[];
}

export type PaymentMode = "cash" | "online";

export type SessionStatus = "parked" | "completed";

export interface ParkingSession {
  id: string;
  tokenCode: string;
  vehicleTypeId: string;
  vehicleNumber: string;
  vehiclePhotoUrl?: string;
  entryTime: string; // ISO
  exitTime?: string; // ISO
  amountPaidAtEntry: number;
  paymentModeAtEntry?: PaymentMode; // set only if amountPaidAtEntry > 0
  amountPaidAtExit?: number;
  paymentModeAtExit?: PaymentMode;
  totalAmount?: number; // computed total cost, set once the vehicle exits
  recordedBy: string; // who logged the entry
  exitRecordedBy?: string; // who logged the exit/collected the exit balance or refund
  status: SessionStatus;
  memberId?: string; // set when this visit was covered by an active membership
}

export interface Expense {
  id: string;
  amount: number;
  title: string;
  note?: string;
  expenseDate: string; // ISO, defaults to today, editable within current month
  recordedBy: string;
}

export interface Member {
  id: string;
  vehicleNumber: string; // uppercase, trimmed — the matching key at Park-In
  vehicleTypeId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: Address;
  idProof?: IdProof;
  vehiclePhotoUrl?: string;
  durationMonths: number;
  feeAmount: number; // total fee for this membership period (looked up from VehicleType.membershipPricing)
  startDate: string; // ISO
  expiryDate: string; // ISO
  recordedBy: string;
}

export interface MemberPayment {
  id: string;
  memberId: string;
  amount: number;
  paymentMode: PaymentMode;
  paidAt: string; // ISO
  type: "signup" | "renewal";
  recordedBy: string;
}
