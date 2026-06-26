"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  initialExpenses,
  initialMemberPayments,
  initialMembers,
  initialSessions,
} from "./mockData";
import { supabase } from "./supabaseClient";
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

const PHONE_EMAIL_DOMAIN = "parkesy.internal";
function phoneToEmail(phone: string): string {
  return `${phone.trim()}@${PHONE_EMAIL_DOMAIN}`;
}

function mapVehicleTypeRow(row: {
  id: string;
  name: VehicleType["name"];
  total_slots: number;
  slabs: RateSlab[];
  membership_pricing: VehicleType["membershipPricing"];
}): VehicleType {
  return {
    id: row.id,
    name: row.name,
    totalSlots: row.total_slots,
    slabs: row.slabs ?? [],
    membershipPricing: row.membership_pricing ?? [],
  };
}

function mapInviteRow(row: {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: Role;
  created_at: string;
}): TeamInvite {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    pin: row.pin,
    role: row.role,
    createdAt: row.created_at,
  };
}

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
  role: Role;
  userName: string;
  userAddress: Address;
  phone: string;
  signup: (phone: string, password: string, name: string) => Promise<string | null>;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (name: string, address: Address) => void;
  teamInvites: TeamInvite[];
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
  const [role, setRole] = useState<Role>("employee");
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState<Address>({});
  const [phone, setPhone] = useState("");
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [businessName, setBusinessNameState] = useState("");
  const [businessAddress, setBusinessAddressState] = useState<Address>({});
  const [businessPhone, setBusinessPhoneState] = useState("");
  const [vehicleNumberCaptureMode, setVehicleNumberCaptureModeState] = useState<VehicleNumberCaptureMode>("full");
  const [collectAtCheckIn, setCollectAtCheckInState] = useState(true);
  const [longStayThresholdHours, setLongStayThresholdHoursState] = useState(24);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);

  // Mock/local-only for now — sessions, expenses, members, and payments are
  // the next phase to move onto Supabase. Everything else on this page
  // (auth, team invites, business settings, vehicle types) is already real.
  useEffect(() => {
    setSessions(initialSessions);
    setExpenses(initialExpenses);
    setMembers(initialMembers);
    setMemberPayments(initialMemberPayments);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadForSession(userId: string | null) {
      // Mark "still checking" immediately for every transition (not just the
      // first one) — otherwise a stale isAuthenticated=false from the previous
      // check can cause a premature redirect while this fetch is in flight.
      setAuthChecked(false);

      if (!userId) {
        if (active) {
          setIsAuthenticated(false);
          setBusinessId(null);
          setAuthChecked(true);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone, address, role, business_id")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (!profile) {
        // Signed in but the profile/business setup never completed.
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      setRole(profile.role);
      setUserName(profile.name);
      setUserAddress((profile.address as Address) ?? {});
      setPhone(profile.phone);
      setBusinessId(profile.business_id);

      const [{ data: business }, { data: vts }, { data: invites }] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", profile.business_id).maybeSingle(),
        supabase.from("vehicle_types").select("*").eq("business_id", profile.business_id),
        supabase.from("team_invites").select("*").eq("business_id", profile.business_id).is("redeemed_at", null),
      ]);

      if (!active) return;

      if (business) {
        setBusinessNameState(business.name);
        setBusinessAddressState((business.address as Address) ?? {});
        setBusinessPhoneState(business.phone ?? "");
        setVehicleNumberCaptureModeState(business.vehicle_number_capture_mode);
        setCollectAtCheckInState(business.collect_at_checkin);
        setLongStayThresholdHoursState(business.long_stay_threshold_hours);
      }
      if (vts) setVehicleTypes(vts.map(mapVehicleTypeRow));
      if (invites) setTeamInvites(invites.map(mapInviteRow));

      setIsAuthenticated(true);
      setAuthChecked(true);
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadForSession(session?.user.id ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
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
      role,
      userName,
      userAddress,
      phone,
      signup: async (newPhone, password, name) => {
        const email = phoneToEmail(newPhone);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          return error.message.toLowerCase().includes("already registered")
            ? "This phone number is already registered."
            : error.message;
        }
        if (!data.session) {
          return "Could not create account — please try again.";
        }
        const { error: rpcError } = await supabase.rpc("complete_signup", {
          p_name: name.trim(),
          p_phone: newPhone.trim(),
        });
        if (rpcError) {
          return rpcError.message;
        }
        // Deliberately does not stay authenticated — user is sent back to Login.
        await supabase.auth.signOut();
        return null;
      },
      login: async (loginPhone, password) => {
        const email = phoneToEmail(loginPhone);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return !error;
      },
      logout: () => {
        void supabase.auth.signOut();
      },
      updateUserProfile: (name, address) => {
        const trimmedName = name.trim() || userName;
        setUserName(trimmedName);
        setUserAddress(address);
        void supabase.auth.getUser().then(({ data }) => {
          const userId = data.user?.id;
          if (!userId) return;
          void supabase.from("profiles").update({ name: trimmedName, address }).eq("id", userId);
        });
      },
      teamInvites,
      addTeamInvite: (name, phoneNum, pin, inviteRole) => {
        if (!businessId) return;
        void supabase
          .from("team_invites")
          .insert({ business_id: businessId, name: name.trim(), phone: phoneNum.trim(), pin, role: inviteRole })
          .select()
          .single()
          .then(({ data }) => {
            if (data) setTeamInvites((prev) => [mapInviteRow(data), ...prev]);
          });
      },
      removeTeamInvite: (id) => {
        setTeamInvites((prev) => prev.filter((inv) => inv.id !== id));
        void supabase.from("team_invites").delete().eq("id", id);
      },
      businessName,
      businessAddress,
      businessPhone,
      setBusinessDetails: (name, address, phone_) => {
        if (!businessId) return;
        const trimmedName = name.trim() || businessName;
        setBusinessNameState(trimmedName);
        setBusinessAddressState(address);
        setBusinessPhoneState(phone_.trim());
        void supabase
          .from("businesses")
          .update({ name: trimmedName, address, phone: phone_.trim() })
          .eq("id", businessId);
      },
      vehicleNumberCaptureMode,
      setVehicleNumberCaptureMode: (mode) => {
        if (!businessId) return;
        setVehicleNumberCaptureModeState(mode);
        void supabase.from("businesses").update({ vehicle_number_capture_mode: mode }).eq("id", businessId);
      },
      collectAtCheckIn,
      setCollectAtCheckIn: (value) => {
        if (!businessId) return;
        setCollectAtCheckInState(value);
        void supabase.from("businesses").update({ collect_at_checkin: value }).eq("id", businessId);
      },
      longStayThresholdHours,
      setLongStayThresholdHours: (hours) => {
        if (!businessId) return;
        setLongStayThresholdHoursState(hours);
        void supabase.from("businesses").update({ long_stay_threshold_hours: hours }).eq("id", businessId);
      },
      vehicleTypes,
      updateVehicleTypeSlotsAndSlabs: (vehicleTypeId, totalSlots, slabs) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, totalSlots, slabs } : vt))
        );
        void supabase.from("vehicle_types").update({ total_slots: totalSlots, slabs }).eq("id", vehicleTypeId);
      },
      updateVehicleTypeMembershipPricing: (vehicleTypeId, pricing) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, membershipPricing: pricing } : vt))
        );
        void supabase.from("vehicle_types").update({ membership_pricing: pricing }).eq("id", vehicleTypeId);
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
      role,
      userName,
      userAddress,
      phone,
      businessId,
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
