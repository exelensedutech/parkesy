"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialExpenses, initialSessions, vehicleTypes } from "./mockData";
import { checkPassword, createDeviceAccount, getDeviceAccount, updateDevicePassword } from "./mockAuth";
import { Expense, ParkingSession, PaymentMode, Role, VehicleType } from "./types";

const SESSION_STORAGE_KEY = "parkesy-session";

interface AppState {
  authChecked: boolean;
  isAuthenticated: boolean;
  hasAccount: boolean;
  role: Role;
  userName: string;
  phone: string;
  signup: (phone: string, password: string) => void;
  login: (password: string) => boolean;
  logout: () => void;
  resetPassword: (newPassword: string) => void;
  vehicleTypes: VehicleType[];
  sessions: ParkingSession[];
  expenses: Expense[];
  startSession: (
    vehicleTypeId: string,
    vehicleNumber: string,
    amountPaidAtEntry: number,
    paymentModeAtEntry?: PaymentMode
  ) => void;
  completeSession: (
    id: string,
    totalAmount: number,
    amountPaidAtExit: number,
    paymentModeAtExit?: PaymentMode
  ) => void;
  addExpense: (amount: number, title: string, note: string | undefined, expenseDate: string) => void;
}

const AppContext = createContext<AppState | null>(null);

let tokenCounter = 103;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [role, setRole] = useState<Role>("employee");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");

  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setSessions(initialSessions);
    setExpenses(initialExpenses);

    const account = getDeviceAccount();
    if (account) {
      setHasAccount(true);
      setPhone(account.phone);
      setRole(account.role);
      setUserName(account.name);
      if (window.localStorage.getItem(SESSION_STORAGE_KEY) === "1") {
        setIsAuthenticated(true);
      }
    }
    setAuthChecked(true);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      authChecked,
      isAuthenticated,
      hasAccount,
      role,
      userName,
      phone,
      signup: (newPhone, password) => {
        const account = createDeviceAccount(newPhone, password);
        setHasAccount(true);
        setPhone(account.phone);
        setRole(account.role);
        setUserName(account.name);
        // Deliberately does not authenticate — user is sent back to Login.
      },
      login: (password) => {
        if (!checkPassword(password)) return false;
        window.localStorage.setItem(SESSION_STORAGE_KEY, "1");
        setIsAuthenticated(true);
        return true;
      },
      logout: () => {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setIsAuthenticated(false);
      },
      resetPassword: (newPassword) => {
        updateDevicePassword(newPassword);
      },
      vehicleTypes,
      sessions,
      expenses,
      startSession: (vehicleTypeId, vehicleNumber, amountPaidAtEntry, paymentModeAtEntry) => {
        const newSession: ParkingSession = {
          id: `s${Date.now()}`,
          tokenCode: `T-${tokenCounter++}`,
          vehicleTypeId,
          vehicleNumber,
          entryTime: new Date().toISOString(),
          amountPaidAtEntry,
          paymentModeAtEntry: amountPaidAtEntry > 0 ? paymentModeAtEntry : undefined,
          recordedBy: userName,
          status: "parked",
        };
        setSessions((prev) => [newSession, ...prev]);
      },
      completeSession: (id, totalAmount, amountPaidAtExit, paymentModeAtExit) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: "completed",
                  exitTime: new Date().toISOString(),
                  totalAmount,
                  amountPaidAtExit,
                  paymentModeAtExit: amountPaidAtExit > 0 ? paymentModeAtExit : undefined,
                }
              : s
          )
        );
      },
      addExpense: (amount, title, note, expenseDate) => {
        const newExpense: Expense = {
          id: `e${Date.now()}`,
          amount,
          title,
          note,
          expenseDate,
          recordedBy: userName,
        };
        setExpenses((prev) => [newExpense, ...prev]);
      },
    }),
    [authChecked, isAuthenticated, hasAccount, role, userName, phone, sessions, expenses]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
