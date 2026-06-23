"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialExpenses, initialSessions, vehicleTypes } from "./mockData";
import { Expense, ParkingSession, Role, VehicleType } from "./types";

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  vehicleTypes: VehicleType[];
  sessions: ParkingSession[];
  expenses: Expense[];
  startSession: (vehicleTypeId: string, vehicleNumber: string | undefined, recordedBy: string) => void;
  completeSession: (
    id: string,
    amountCharged: number,
    paymentMode: "cash" | "gpay"
  ) => void;
  addExpense: (amount: number, category: string, note: string | undefined, recordedBy: string) => void;
}

const AppContext = createContext<AppState | null>(null);

let tokenCounter = 103;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("employee");
  // Start empty so server-rendered HTML matches the client's first paint.
  // initialSessions/initialExpenses use relative timestamps (Date.now()),
  // which differ between server render and client hydration and would
  // otherwise cause a hydration mismatch on time-derived text.
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setSessions(initialSessions);
    setExpenses(initialExpenses);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      vehicleTypes,
      sessions,
      expenses,
      startSession: (vehicleTypeId, vehicleNumber, recordedBy) => {
        const newSession: ParkingSession = {
          id: `s${Date.now()}`,
          tokenCode: `T-${tokenCounter++}`,
          vehicleTypeId,
          vehicleNumber,
          entryTime: new Date().toISOString(),
          recordedBy,
          status: "parked",
        };
        setSessions((prev) => [newSession, ...prev]);
      },
      completeSession: (id, amountCharged, paymentMode) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: "completed", exitTime: new Date().toISOString(), amountCharged, paymentMode }
              : s
          )
        );
      },
      addExpense: (amount, category, note, recordedBy) => {
        const newExpense: Expense = {
          id: `e${Date.now()}`,
          amount,
          category,
          note,
          expenseDate: new Date().toISOString(),
          recordedBy,
        };
        setExpenses((prev) => [newExpense, ...prev]);
      },
    }),
    [role, sessions, expenses]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
