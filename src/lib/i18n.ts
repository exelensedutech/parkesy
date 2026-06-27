import { Language } from "./types";

// Proof-of-concept scope: only the Park In screen's labels are translated so
// far. Tamil strings here are a best-effort starting point, not reviewed by
// a native speaker — verify before relying on them in front of real
// attendants/customers, and expand screen by screen rather than all at once
// so each batch stays reviewable.
const en = {
  vehicleDetails: "Vehicle Details",
  vehicleType: "Vehicle Type",
  vehicleNumber: "Vehicle number",
  last4Digits: "Last 4 digits",
  payment: "Payment",
  amountPaid: "Amount paid",
  paymentMode: "Payment mode",
  cash: "Cash",
  online: "Online",
  parkAndIssueTicket: "Park & Issue Ticket",
  issuingTicket: "Issuing Ticket…",
  vehicleNumberRequired: "Vehicle number is required",
  couldNotPark: "Could not park the vehicle — please try again",
  vehicleTypeBike: "Bike",
  vehicleTypeCycle: "Cycle",
  vehicleTypeCar: "Car",
} as const;

export type TranslationKey = keyof typeof en;

const ta: Record<TranslationKey, string> = {
  vehicleDetails: "வாகன விவரங்கள்",
  vehicleType: "வாகன வகை",
  vehicleNumber: "வாகன எண்",
  last4Digits: "கடைசி 4 இலக்கங்கள்",
  payment: "கட்டணம்",
  amountPaid: "செலுத்திய தொகை",
  paymentMode: "கட்டண முறை",
  cash: "காசு",
  online: "ஆன்லைன்",
  parkAndIssueTicket: "பார்க் செய்து டிக்கெட் கொடு",
  issuingTicket: "டிக்கெட் தயாராகிறது…",
  vehicleNumberRequired: "வாகன எண் தேவை",
  couldNotPark: "வாகனத்தை பார்க் செய்ய முடியவில்லை — மீண்டும் முயற்சிக்கவும்",
  vehicleTypeBike: "பைக்",
  vehicleTypeCycle: "சைக்கிள்",
  vehicleTypeCar: "கார்",
};

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, ta };

export function translate(language: Language, key: TranslationKey): string {
  return dictionaries[language][key] ?? dictionaries.en[key];
}
