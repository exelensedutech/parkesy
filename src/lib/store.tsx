"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  initialExpenses,
  initialMemberPayments,
  initialMembers,
  initialSessions,
  vehicleTypes as initialVehicleTypes,
} from "./mockData";
import {
  checkPassword,
  createDeviceAccount,
  getDeviceAccount,
  resolveRole,
  updateDeviceProfile,
  updateDevicePassword,
} from "./mockAuth";
import { addTeamInvite as addTeamInviteToStorage, getTeamInvites, removeTeamInvite as removeTeamInviteFromStorage } from "./teamInvites";
import { addMonths } from "./calc";
import { getMembershipPrice } from "./membership";
import {
  Address,
  Expense,
  IdProof,
  Member,
  MemberPayment,
  ParkingSession,
  PaymentMode,
  RateSlab,
  Role,
  TeamInvite,
  VehicleNumberCaptureMode,
  VehicleType,
} from "./types";

const SESSION_STORAGE_KEY = "parkesy-session";
const BUSINESS_NAME_STORAGE_KEY = "parkesy-business-name";
const BUSINESS_ADDRESS_STORAGE_KEY = "parkesy-business-address";
const BUSINESS_PHONE_STORAGE_KEY = "parkesy-business-phone";
const VEHICLE_NUMBER_CAPTURE_MODE_KEY = "parkesy-vehicle-number-capture-mode";
const COLLECT_AT_CHECKIN_KEY = "parkesy-collect-at-checkin";
const LONG_STAY_THRESHOLD_KEY = "parkesy-long-stay-threshold-hours";
const DEFAULT_BUSINESS_NAME = "Sarva Parking";
const DEFAULT_LONG_STAY_THRESHOLD_HOURS = 24;

export interface AddMemberInput {
  vehicleNumber: string;
  vehicleTypeId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: Address;
  idProof?: IdProof;
  vehiclePhotoUrl?: string;
  durationMonths: number;
  paymentMode: PaymentMode;
}

interface AppState {
  authChecked: boolean;
  isAuthenticated: boolean;
  hasAccount: boolean;
  role: Role;
  userName: string;
  userAddress: Address;
  phone: string;
  signup: (phone: string, password: string, name: string) => void;
  login: (password: string) => boolean;
  logout: () => void;
  resetPassword: (newPassword: string) => void;
  updateUserProfile: (name: string, address: Address) => void;
  teamInvites: TeamInvite[];
  findInviteByPhone: (phone: string) => TeamInvite | undefined;
  addTeamInvite: (name: string, phone: string, pin: string, role: Role) => void;
  removeTeamInvite: (id: string) => void;
  businessName: string;
  businessAddress: Address;
  businessPhone: string;
  setBusinessDetails: (name: string, address: Address, phone: string) => void;
  vehicleNumberCaptureMode: VehicleNumberCaptureMode;
  setVehicleNumberCaptureMode: (mode: VehicleNumberCaptureMode) => void;
  collectAtCheckIn: boolean;
  setCollectAtCheckIn: (value: boolean) => void;
  longStayThresholdHours: number;
  setLongStayThresholdHours: (hours: number) => void;
  vehicleTypes: VehicleType[];
  updateVehicleTypeSlotsAndSlabs: (vehicleTypeId: string, totalSlots: number, slabs: RateSlab[]) => void;
  updateVehicleTypeMembershipPricing: (
    vehicleTypeId: string,
    pricing: { durationMonths: number; price: number }[]
  ) => void;
  sessions: ParkingSession[];
  expenses: Expense[];
  members: Member[];
  memberPayments: MemberPayment[];
  findActiveMember: (vehicleNumber: string) => Member | undefined;
  addMember: (input: AddMemberInput) => void;
  renewMember: (memberId: string, durationMonths: number, paymentMode: PaymentMode) => void;
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
  updateSessionVehicleNumber: (sessionId: string, vehicleNumber: string) => void;
  addExpense: (amount: number, title: string, note: string | undefined, expenseDate: string) => void;
  updateExpense: (
    id: string,
    amount: number,
    title: string,
    note: string | undefined,
    expenseDate: string
  ) => void;
}

const AppContext = createContext<AppState | null>(null);

let tokenCounter = 103;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [role, setRole] = useState<Role>("employee");
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState<Address>({});
  const [phone, setPhone] = useState("");

  // Starts at the default (not "") so server and first client paint match;
  // the real saved values (if any) are only read from localStorage after mount.
  const [businessName, setBusinessNameState] = useState(DEFAULT_BUSINESS_NAME);
  const [businessAddress, setBusinessAddressState] = useState<Address>({});
  const [businessPhone, setBusinessPhoneState] = useState("");
  const [vehicleNumberCaptureMode, setVehicleNumberCaptureModeState] = useState<VehicleNumberCaptureMode>("full");
  const [collectAtCheckIn, setCollectAtCheckInState] = useState(true);
  const [longStayThresholdHours, setLongStayThresholdHoursState] = useState(DEFAULT_LONG_STAY_THRESHOLD_HOURS);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(initialVehicleTypes);

  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);

  useEffect(() => {
    setSessions(initialSessions);
    setExpenses(initialExpenses);
    setMembers(initialMembers);
    setMemberPayments(initialMemberPayments);
    setTeamInvites(getTeamInvites());

    const savedName = window.localStorage.getItem(BUSINESS_NAME_STORAGE_KEY);
    if (savedName) setBusinessNameState(savedName);
    const savedAddress = window.localStorage.getItem(BUSINESS_ADDRESS_STORAGE_KEY);
    if (savedAddress) {
      try {
        setBusinessAddressState(JSON.parse(savedAddress));
      } catch {
        // ignore malformed legacy value
      }
    }
    const savedPhone = window.localStorage.getItem(BUSINESS_PHONE_STORAGE_KEY);
    if (savedPhone) setBusinessPhoneState(savedPhone);
    const savedCaptureMode = window.localStorage.getItem(VEHICLE_NUMBER_CAPTURE_MODE_KEY);
    if (savedCaptureMode === "full" || savedCaptureMode === "last4") setVehicleNumberCaptureModeState(savedCaptureMode);
    const savedCollectAtCheckIn = window.localStorage.getItem(COLLECT_AT_CHECKIN_KEY);
    if (savedCollectAtCheckIn !== null) setCollectAtCheckInState(savedCollectAtCheckIn === "1");
    const savedThreshold = window.localStorage.getItem(LONG_STAY_THRESHOLD_KEY);
    if (savedThreshold) {
      const parsed = parseFloat(savedThreshold);
      if (!Number.isNaN(parsed) && parsed > 0) setLongStayThresholdHoursState(parsed);
    }

    const account = getDeviceAccount();
    if (account) {
      setHasAccount(true);
      setPhone(account.phone);
      setRole(account.role);
      setUserName(account.name);
      setUserAddress(account.address ?? {});
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

  const findInviteByPhone = (phoneToFind: string): TeamInvite | undefined => {
    return teamInvites.find((inv) => inv.phone === phoneToFind.trim());
  };

  const value = useMemo<AppState>(
    () => ({
      authChecked,
      isAuthenticated,
      hasAccount,
      role,
      userName,
      userAddress,
      phone,
      signup: (newPhone, password, name) => {
        const invite = findInviteByPhone(newPhone);
        const role_ = invite ? invite.role : resolveRole(newPhone);
        const account = createDeviceAccount(newPhone, password, name, role_);
        if (invite) {
          removeTeamInviteFromStorage(invite.id);
          setTeamInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
        }
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
      updateUserProfile: (name, address) => {
        const updated = updateDeviceProfile(name, address);
        if (!updated) return;
        setUserName(updated.name);
        setUserAddress(address);
      },
      teamInvites,
      findInviteByPhone,
      addTeamInvite: (name, phoneNum, pin, inviteRole) => {
        const invite = addTeamInviteToStorage(name, phoneNum, pin, inviteRole);
        setTeamInvites((prev) => [invite, ...prev]);
      },
      removeTeamInvite: (id) => {
        removeTeamInviteFromStorage(id);
        setTeamInvites((prev) => prev.filter((inv) => inv.id !== id));
      },
      resetPassword: (newPassword) => {
        updateDevicePassword(newPassword);
      },
      businessName,
      businessAddress,
      businessPhone,
      setBusinessDetails: (name, address, phone_) => {
        const trimmedName = name.trim() || DEFAULT_BUSINESS_NAME;
        window.localStorage.setItem(BUSINESS_NAME_STORAGE_KEY, trimmedName);
        window.localStorage.setItem(BUSINESS_ADDRESS_STORAGE_KEY, JSON.stringify(address));
        window.localStorage.setItem(BUSINESS_PHONE_STORAGE_KEY, phone_.trim());
        setBusinessNameState(trimmedName);
        setBusinessAddressState(address);
        setBusinessPhoneState(phone_.trim());
      },
      vehicleNumberCaptureMode,
      setVehicleNumberCaptureMode: (mode) => {
        window.localStorage.setItem(VEHICLE_NUMBER_CAPTURE_MODE_KEY, mode);
        setVehicleNumberCaptureModeState(mode);
      },
      collectAtCheckIn,
      setCollectAtCheckIn: (value) => {
        window.localStorage.setItem(COLLECT_AT_CHECKIN_KEY, value ? "1" : "0");
        setCollectAtCheckInState(value);
      },
      longStayThresholdHours,
      setLongStayThresholdHours: (hours) => {
        window.localStorage.setItem(LONG_STAY_THRESHOLD_KEY, String(hours));
        setLongStayThresholdHoursState(hours);
      },
      vehicleTypes,
      updateVehicleTypeSlotsAndSlabs: (vehicleTypeId, totalSlots, slabs) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, totalSlots, slabs } : vt))
        );
      },
      updateVehicleTypeMembershipPricing: (vehicleTypeId, pricing) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, membershipPricing: pricing } : vt))
        );
      },
      sessions,
      expenses,
      members,
      memberPayments,
      findActiveMember,
      addMember: (input) => {
        const vehicleType = vehicleTypes.find((vt) => vt.id === input.vehicleTypeId);
        const feeAmount = vehicleType ? getMembershipPrice(vehicleType, input.durationMonths) : 0;
        const startDate = new Date().toISOString();
        const newMember: Member = {
          id: `m${Date.now()}`,
          vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
          vehicleTypeId: input.vehicleTypeId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          idProof: input.idProof,
          vehiclePhotoUrl: input.vehiclePhotoUrl,
          durationMonths: input.durationMonths,
          feeAmount,
          startDate,
          expiryDate: addMonths(startDate, input.durationMonths),
          recordedBy: userName,
        };
        setMembers((prev) => [newMember, ...prev]);
        setMemberPayments((prev) => [
          {
            id: `mp${Date.now()}`,
            memberId: newMember.id,
            amount: feeAmount,
            paymentMode: input.paymentMode,
            paidAt: startDate,
            type: "signup",
            recordedBy: userName,
          },
          ...prev,
        ]);
      },
      renewMember: (memberId, durationMonths, paymentMode) => {
        const member = members.find((m) => m.id === memberId);
        if (!member) return;
        const vehicleType = vehicleTypes.find((vt) => vt.id === member.vehicleTypeId);
        const feeAmount = vehicleType ? getMembershipPrice(vehicleType, durationMonths) : 0;
        const now = Date.now();
        const base = new Date(Math.max(new Date(member.expiryDate).getTime(), now)).toISOString();
        const newExpiry = addMonths(base, durationMonths);
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, expiryDate: newExpiry, durationMonths, feeAmount } : m))
        );
        setMemberPayments((prev) => [
          {
            id: `mp${Date.now()}`,
            memberId,
            amount: feeAmount,
            paymentMode,
            paidAt: new Date().toISOString(),
            type: "renewal",
            recordedBy: userName,
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
                  paymentModeAtExit: amountPaidAtExit !== 0 ? paymentModeAtExit : undefined,
                  exitRecordedBy: userName,
                }
              : s
          )
        );
      },
      updateSessionVehicleNumber: (sessionId, vehicleNumber) => {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, vehicleNumber: vehicleNumber.trim().toUpperCase() } : s))
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
      updateExpense: (id, amount, title, note, expenseDate) => {
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, amount, title, note, expenseDate } : e))
        );
      },
    }),
    [
      authChecked,
      isAuthenticated,
      hasAccount,
      role,
      userName,
      userAddress,
      phone,
      businessName,
      businessAddress,
      businessPhone,
      vehicleNumberCaptureMode,
      collectAtCheckIn,
      longStayThresholdHours,
      vehicleTypes,
      sessions,
      expenses,
      members,
      memberPayments,
      teamInvites,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
