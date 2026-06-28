import { Language } from "./types";

// Scope: Park In and Park Out screens are translated so far. Tamil strings
// here are a best-effort starting point, self-reviewed for grammar/register
// but NOT confirmed by a native speaker — verify before relying on them in
// front of real attendants/customers. Expand screen by screen rather than
// all at once so each batch stays reviewable.
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
  editVehicleNumber: "Edit vehicle number",
  inLabel: "In",
  parkedFor: "Parked for",
  memberVisitNoCharge: "Member visit — no charge",
  totalCost: "Total cost",
  alreadyPaidAtEntry: "Already paid at entry",
  refundToCustomer: "Refund to customer",
  balanceDue: "Balance due",
  refundVia: "Refund via",
  markingOut: "Marking Out…",
  refundAndMarkOut: "Refund & Mark Out",
  collectBalanceAndMarkOut: "Collect Balance & Mark Out",
  markVehicleOut: "Mark Vehicle Out",
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
  // "கொடு" (give) read too blunt/informal for a business app button;
  // "வழங்கு" (issue/provide) matches the formal register "Issue Ticket" has
  // in English.
  parkAndIssueTicket: "பார்க் செய்து டிக்கெட் வழங்கு",
  issuingTicket: "டிக்கெட் தயாராகிறது…",
  vehicleNumberRequired: "வாகன எண் தேவை",
  couldNotPark: "வாகனத்தை பார்க் செய்ய முடியவில்லை — மீண்டும் முயற்சிக்கவும்",
  vehicleTypeBike: "பைக்",
  vehicleTypeCycle: "சைக்கிள்",
  vehicleTypeCar: "கார்",
  editVehicleNumber: "வாகன எண்ணை திருத்து",
  inLabel: "வந்த நேரம்",
  parkedFor: "நிறுத்தப்பட்ட நேரம்",
  memberVisitNoCharge: "உறுப்பினர் வருகை — கட்டணம் இல்லை",
  totalCost: "மொத்த தொகை",
  alreadyPaidAtEntry: "நுழையும்போது செலுத்தியது",
  refundToCustomer: "வாடிக்கையாளருக்கு திரும்பத் தர வேண்டியது",
  balanceDue: "செலுத்த வேண்டிய தொகை",
  refundVia: "திரும்பத் தரும் முறை",
  markingOut: "வெளியேற்றப்படுகிறது…",
  refundAndMarkOut: "திரும்பத் தந்து வெளியேற்று",
  collectBalanceAndMarkOut: "தொகையை வசூலித்து வெளியேற்று",
  markVehicleOut: "வாகனத்தை வெளியேற்று",
};

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, ta };

export function translate(language: Language, key: TranslationKey): string {
  return dictionaries[language][key] ?? dictionaries.en[key];
}
