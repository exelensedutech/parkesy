"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  initialExpenses,
  initialMemberPayments,
  initialMembers,
  initialSessions,
  vehicleTypes as initialVehicleTypes,
} from "./mockData";
import { checkPassword, createDeviceAccount, getDeviceAccount, updateDevicePassword } from "./mockAuth";
import { addOneMonth } from "./calc";
import { Expense, Member, MemberPayment, ParkingSession, PaymentMode, Role, VehicleType } from "./types";

const SESSION_STORAGE_KEY = "parkesy-session";
const BUSINESS_NAME_STORAGE_KEY = "parkesy-business-name";
const DEFAULT_BUSINESS_NAME = "Sarva Parking";

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
  businessName: string;
  setBusinessName: (name: string) => void;
  vehicleTypes: VehicleType[];
  updateVehicleTypeSlots: (vehicleTypeId: string, totalSlots: number) => void;
  sessions: ParkingSession[];
  expenses: Expense[];
  members: Member[];
  memberPayments: MemberPayment[];
  findActiveMember: (vehicleNumber: string) => Member | undefined;
  addMember: (
    vehicleNumber: string,
    vehicleTypeId: string,
    customerName: string | undefined,
    monthlyFee: number,
    paymentMode: PaymentMode
  ) => void;
  renewMember: (memberId: string, paymentMode: PaymentMode) => void;
  startSession: (
    vehicleTypeId: string,
    vehicleNumber: string,
    amountPaidAtEntry: number,
    paymentModeAtEntry?: PaymentMode,
    vehiclePhotoUrl?: string
  ) => string;
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

  // Starts at the default (not "") so server and first client paint match;
  // the real saved name (if any) is only read from localStorage after mount.
  const [businessName, setBusinessNameState] = useState(DEFAULT_BUSINESS_NAME);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(initialVehicleTypes);

  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);

  useEffect(() => {
    setSessions(initialSessions);
    setExpenses(initialExpenses);
    setMembers(initialMembers);
    setMemberPayments(initialMemberPayments);

    const savedName = window.localStorage.getItem(BUSINESS_NAME_STORAGE_KEY);
    if (savedName) setBusinessNameState(savedName);

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

  const findActiveMember = (vehicleNumber: string): Member | undefined => {
    const normalized = vehicleNumber.trim().toUpperCase();
    if (!normalized) return undefined;
    return members.find((m) => m.vehicleNumber === normalized && new Date(m.expiryDate).getTime() >= Date.now());
  };

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
      businessName,
      setBusinessName: (name) => {
        const trimmed = name.trim() || DEFAULT_BUSINESS_NAME;
        window.localStorage.setItem(BUSINESS_NAME_STORAGE_KEY, trimmed);
        setBusinessNameState(trimmed);
      },
      vehicleTypes,
      updateVehicleTypeSlots: (vehicleTypeId, totalSlots) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, totalSlots } : vt))
        );
      },
      sessions,
      expenses,
      members,
      memberPayments,
      findActiveMember,
      addMember: (vehicleNumber, vehicleTypeId, customerName, monthlyFee, paymentMode) => {
        const startDate = new Date().toISOString();
        const newMember: Member = {
          id: `m${Date.now()}`,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleTypeId,
          customerName,
          monthlyFee,
          startDate,
          expiryDate: addOneMonth(startDate),
          recordedBy: userName,
        };
        setMembers((prev) => [newMember, ...prev]);
        setMemberPayments((prev) => [
          { id: `mp${Date.now()}`, memberId: newMember.id, amount: monthlyFee, paymentMode, paidAt: startDate, type: "signup" },
          ...prev,
        ]);
      },
      renewMember: (memberId, paymentMode) => {
        const member = members.find((m) => m.id === memberId);
        if (!member) return;
        const now = Date.now();
        const base = new Date(Math.max(new Date(member.expiryDate).getTime(), now)).toISOString();
        const newExpiry = addOneMonth(base);
        setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, expiryDate: newExpiry } : m)));
        setMemberPayments((prev) => [
          {
            id: `mp${Date.now()}`,
            memberId,
            amount: member.monthlyFee,
            paymentMode,
            paidAt: new Date().toISOString(),
            type: "renewal",
          },
          ...prev,
        ]);
      },
      startSession: (vehicleTypeId, vehicleNumber, amountPaidAtEntry, paymentModeAtEntry, vehiclePhotoUrl) => {
        const activeMember = findActiveMember(vehicleNumber);
        const finalAmount = activeMember ? 0 : amountPaidAtEntry;
        const tokenCode = `T-${tokenCounter++}`;
        const newSession: ParkingSession = {
          id: `s${Date.now()}`,
          tokenCode,
          vehicleTypeId,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehiclePhotoUrl,
          entryTime: new Date().toISOString(),
          amountPaidAtEntry: finalAmount,
          paymentModeAtEntry: finalAmount > 0 ? paymentModeAtEntry : undefined,
          recordedBy: userName,
          status: "parked",
          memberId: activeMember?.id,
        };
        setSessions((prev) => [newSession, ...prev]);
        return tokenCode;
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
    [
      authChecked,
      isAuthenticated,
      hasAccount,
      role,
      userName,
      phone,
      businessName,
      vehicleTypes,
      sessions,
      expenses,
      members,
      memberPayments,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
