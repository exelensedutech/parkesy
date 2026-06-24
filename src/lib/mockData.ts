import { Expense, ParkingSession, VehicleType } from "./types";

export const vehicleTypes: VehicleType[] = [
  {
    id: "bike",
    name: "Bike",
    slabs: [
      { order: 1, fromHour: 0, toHour: 1, amount: 10, type: "flat" },
      { order: 2, fromHour: 1, toHour: null, amount: 5, type: "per_hour" },
    ],
  },
  {
    id: "cycle",
    name: "Cycle",
    slabs: [
      { order: 1, fromHour: 0, toHour: 2, amount: 5, type: "flat" },
      { order: 2, fromHour: 2, toHour: null, amount: 3, type: "per_hour" },
    ],
  },
  {
    id: "car",
    name: "Car",
    slabs: [
      { order: 1, fromHour: 0, toHour: 1, amount: 20, type: "flat" },
      { order: 2, fromHour: 1, toHour: null, amount: 10, type: "per_hour" },
    ],
  },
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const initialSessions: ParkingSession[] = [
  {
    id: "s1",
    tokenCode: "T-101",
    vehicleTypeId: "bike",
    vehicleNumber: "KA01AB1234",
    entryTime: hoursAgo(1.5),
    amountPaidAtEntry: 0,
    recordedBy: "Employee",
    status: "parked",
  },
  {
    id: "s2",
    tokenCode: "T-102",
    vehicleTypeId: "car",
    vehicleNumber: "KA05CD5678",
    entryTime: hoursAgo(0.4),
    amountPaidAtEntry: 20,
    paymentModeAtEntry: "cash",
    recordedBy: "Employee",
    status: "parked",
  },
  {
    id: "s3",
    tokenCode: "T-098",
    vehicleTypeId: "bike",
    vehicleNumber: "KA02XY9090",
    entryTime: hoursAgo(5),
    exitTime: hoursAgo(3),
    amountPaidAtEntry: 0,
    amountPaidAtExit: 15,
    paymentModeAtExit: "cash",
    totalAmount: 15,
    recordedBy: "Employee",
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
    amountPaidAtExit: 5,
    paymentModeAtExit: "online",
    totalAmount: 5,
    recordedBy: "Owner",
    status: "completed",
  },
];

export const initialExpenses: Expense[] = [
  {
    id: "e1",
    amount: 50,
    title: "Tea/Snacks",
    expenseDate: hoursAgo(4),
    recordedBy: "Employee",
  },
  {
    id: "e2",
    amount: 200,
    title: "Maintenance",
    note: "Barrier rope replacement",
    expenseDate: hoursAgo(20),
    recordedBy: "Owner",
  },
];
