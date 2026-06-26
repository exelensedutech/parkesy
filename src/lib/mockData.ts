import { Expense, Member, MemberPayment, ParkingSession, VehicleType } from "./types";

export const vehicleTypes: VehicleType[] = [
  {
    id: "bike",
    name: "Bike",
    totalSlots: 20,
    slabs: [
      { order: 1, fromHour: 0, toHour: 1, amount: 10, type: "flat" },
      { order: 2, fromHour: 1, toHour: null, amount: 5, type: "per_hour" },
    ],
    membershipPricing: [
      { durationMonths: 1, price: 500 },
      { durationMonths: 3, price: 1400 },
      { durationMonths: 6, price: 2700 },
      { durationMonths: 12, price: 5000 },
    ],
  },
  {
    id: "cycle",
    name: "Cycle",
    totalSlots: 10,
    slabs: [
      { order: 1, fromHour: 0, toHour: 2, amount: 5, type: "flat" },
      { order: 2, fromHour: 2, toHour: null, amount: 3, type: "per_hour" },
    ],
    membershipPricing: [
      { durationMonths: 1, price: 300 },
      { durationMonths: 3, price: 850 },
      { durationMonths: 6, price: 1600 },
      { durationMonths: 12, price: 3000 },
    ],
  },
  {
    id: "car",
    name: "Car",
    totalSlots: 8,
    slabs: [
      { order: 1, fromHour: 0, toHour: 1, amount: 20, type: "flat" },
      { order: 2, fromHour: 1, toHour: null, amount: 10, type: "per_hour" },
    ],
    membershipPricing: [
      { durationMonths: 1, price: 800 },
      { durationMonths: 3, price: 2300 },
      { durationMonths: 6, price: 4400 },
      { durationMonths: 12, price: 8000 },
    ],
  },
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

// Spreads seed history across earlier days *this month* (never today),
// scaled to however far into the month "today" is, so "This Month So Far"
// has real history to total up instead of just mirroring today's numbers.
function daysAgoAt(fractionOfMonth: number, hour: number) {
  const dayOfMonth = new Date().getDate();
  const daysBack = Math.max(1, Math.min(dayOfMonth - 1, Math.round(dayOfMonth * fractionOfMonth)));
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const initialSessions: ParkingSession[] = [
  // Currently parked
  {
    id: "s1",
    tokenCode: "T-101",
    vehicleTypeId: "bike",
    vehicleNumber: "KA01AB1234",
    entryTime: hoursAgo(1.5),
    amountPaidAtEntry: 15,
    paymentModeAtEntry: "cash",
    recordedBy: "Vikram Nair",
    status: "parked",
  },
  {
    id: "s2",
    tokenCode: "T-102",
    vehicleTypeId: "car",
    vehicleNumber: "KA05CD5678",
    entryTime: hoursAgo(0.4),
    amountPaidAtEntry: 25,
    paymentModeAtEntry: "cash",
    recordedBy: "Vikram Nair",
    status: "parked",
  },
  {
    id: "s7",
    tokenCode: "T-103",
    vehicleTypeId: "cycle",
    vehicleNumber: "",
    entryTime: hoursAgo(0.2),
    amountPaidAtEntry: 5,
    paymentModeAtEntry: "online",
    recordedBy: "Vikram Nair",
    status: "parked",
  },
  // Long-stay examples — still parked well beyond the default 24h threshold
  {
    id: "s14",
    tokenCode: "T-076",
    vehicleTypeId: "bike",
    vehicleNumber: "KA06UV7788",
    entryTime: hoursAgo(30),
    amountPaidAtEntry: 15,
    paymentModeAtEntry: "cash",
    recordedBy: "Anita Rao",
    status: "parked",
  },
  {
    id: "s15",
    tokenCode: "T-059",
    vehicleTypeId: "car",
    vehicleNumber: "KA09WX4455",
    entryTime: hoursAgo(52),
    amountPaidAtEntry: 20,
    paymentModeAtEntry: "online",
    recordedBy: "Vikram Nair",
    status: "parked",
  },
  // Completed earlier today
  {
    id: "s3",
    tokenCode: "T-098",
    vehicleTypeId: "bike",
    vehicleNumber: "KA02XY9090",
    entryTime: hoursAgo(5),
    exitTime: hoursAgo(3),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 20,
    paymentModeAtExit: "cash",
    totalAmount: 20,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Anita Rao",
    status: "completed",
  },
  {
    id: "s4",
    tokenCode: "T-095",
    vehicleTypeId: "cycle",
    vehicleNumber: "",
    entryTime: hoursAgo(8),
    exitTime: hoursAgo(6),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 8,
    paymentModeAtExit: "online",
    totalAmount: 8,
    recordedBy: "Anita Rao",
    exitRecordedBy: "Anita Rao",
    status: "completed",
  },
  {
    id: "s5",
    tokenCode: "T-090",
    vehicleTypeId: "car",
    vehicleNumber: "KA09EF1122",
    entryTime: hoursAgo(6),
    exitTime: hoursAgo(4),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 35,
    paymentModeAtExit: "online",
    totalAmount: 35,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Vikram Nair",
    status: "completed",
  },
  {
    id: "s6",
    tokenCode: "T-087",
    vehicleTypeId: "bike",
    vehicleNumber: "KA03GH3344",
    entryTime: hoursAgo(10),
    exitTime: hoursAgo(9),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 18,
    paymentModeAtExit: "cash",
    totalAmount: 18,
    recordedBy: "Anita Rao",
    exitRecordedBy: "Vikram Nair",
    status: "completed",
  },
  {
    id: "s13",
    tokenCode: "T-040",
    vehicleTypeId: "car",
    vehicleNumber: "KA04ST5566",
    entryTime: daysAgoAt(0.5, 9),
    exitTime: daysAgoAt(0.5, 10),
    amountPaidAtEntry: 50,
    paymentModeAtEntry: "cash",
    amountPaidAtExit: -15,
    paymentModeAtExit: "cash",
    totalAmount: 35,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Vikram Nair",
    status: "completed",
  },
  // Earlier this month (not today) — gives "This Month So Far" real history
  {
    id: "s8",
    tokenCode: "T-072",
    vehicleTypeId: "car",
    vehicleNumber: "KA07JK5566",
    entryTime: daysAgoAt(0.8, 10),
    exitTime: daysAgoAt(0.8, 13),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 30,
    paymentModeAtExit: "cash",
    totalAmount: 30,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Vikram Nair",
    status: "completed",
  },
  {
    id: "s9",
    tokenCode: "T-068",
    vehicleTypeId: "bike",
    vehicleNumber: "KA01LM7788",
    entryTime: daysAgoAt(0.6, 9),
    exitTime: daysAgoAt(0.6, 12),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 18,
    paymentModeAtExit: "online",
    totalAmount: 18,
    recordedBy: "Anita Rao",
    exitRecordedBy: "Anita Rao",
    status: "completed",
  },
  {
    id: "s10",
    tokenCode: "T-061",
    vehicleTypeId: "bike",
    vehicleNumber: "KA02NP9900",
    entryTime: daysAgoAt(0.45, 8),
    exitTime: daysAgoAt(0.45, 11),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 12,
    paymentModeAtExit: "cash",
    totalAmount: 12,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Anita Rao",
    status: "completed",
  },
  {
    id: "s11",
    tokenCode: "T-054",
    vehicleTypeId: "cycle",
    vehicleNumber: "",
    entryTime: daysAgoAt(0.3, 14),
    exitTime: daysAgoAt(0.3, 17),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 8,
    paymentModeAtExit: "online",
    totalAmount: 8,
    recordedBy: "Vikram Nair",
    exitRecordedBy: "Vikram Nair",
    status: "completed",
  },
  {
    id: "s12",
    tokenCode: "T-047",
    vehicleTypeId: "car",
    vehicleNumber: "KA08QR1212",
    entryTime: daysAgoAt(0.15, 16),
    exitTime: daysAgoAt(0.15, 19),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 40,
    paymentModeAtExit: "cash",
    totalAmount: 40,
    recordedBy: "Anita Rao",
    exitRecordedBy: "Anita Rao",
    status: "completed",
  },
];

export const initialExpenses: Expense[] = [
  {
    id: "e1",
    amount: 30,
    title: "Tea/Snacks",
    expenseDate: hoursAgo(4),
    recordedBy: "Vikram Nair",
  },
  {
    id: "e2",
    amount: 50,
    title: "Maintenance",
    note: "Barrier rope replacement",
    expenseDate: hoursAgo(10),
    recordedBy: "Anita Rao",
  },
  {
    id: "e3",
    amount: 40,
    title: "Generator Fuel",
    expenseDate: daysAgoAt(0.7, 9),
    recordedBy: "Anita Rao",
  },
  {
    id: "e4",
    amount: 25,
    title: "Cleaning Supplies",
    expenseDate: daysAgoAt(0.35, 9),
    recordedBy: "Vikram Nair",
  },
];

function plainDaysAgo(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function plainDaysFromNow(d: number) {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

export const initialMembers: Member[] = [
  {
    id: "m1",
    vehicleNumber: "KA01MM1111",
    vehicleTypeId: "bike",
    customerName: "Ramesh Kumar",
    customerPhone: "9876500001",
    durationMonths: 1,
    feeAmount: 500,
    startDate: plainDaysAgo(20),
    expiryDate: plainDaysFromNow(10),
    recordedBy: "Anita Rao",
  },
  {
    id: "m2",
    vehicleNumber: "KA02NN2222",
    vehicleTypeId: "car",
    customerName: "Priya Shetty",
    customerPhone: "9876500002",
    durationMonths: 1,
    feeAmount: 800,
    startDate: plainDaysAgo(27),
    expiryDate: plainDaysFromNow(3),
    recordedBy: "Anita Rao",
  },
  {
    id: "m3",
    vehicleNumber: "KA03OO3333",
    vehicleTypeId: "bike",
    customerName: "Suresh Babu",
    customerPhone: "9876500003",
    durationMonths: 1,
    feeAmount: 500,
    startDate: plainDaysAgo(40),
    expiryDate: plainDaysAgo(10),
    recordedBy: "Vikram Nair",
  },
];

export const initialMemberPayments: MemberPayment[] = [
  { id: "mp1", memberId: "m1", amount: 500, paymentMode: "online", paidAt: plainDaysAgo(20), type: "signup", recordedBy: "Anita Rao" },
  { id: "mp2", memberId: "m2", amount: 800, paymentMode: "cash", paidAt: plainDaysAgo(27), type: "signup", recordedBy: "Anita Rao" },
  { id: "mp3", memberId: "m3", amount: 500, paymentMode: "cash", paidAt: plainDaysAgo(40), type: "signup", recordedBy: "Vikram Nair" },
];
