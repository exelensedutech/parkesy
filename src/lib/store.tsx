"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { compressImage, randomId } from "./imageCompress";
import { translate, TranslationKey } from "./i18n";
import {
  Address,
  Expense,
  IdProof,
  Language,
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

type ProfilesById = Map<string, string>;
function nameFor(profilesById: ProfilesById, id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return profilesById.get(id) ?? "Unknown";
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

function mapSessionRow(
  row: {
    id: string;
    ticket_code: string;
    vehicle_type_id: string;
    vehicle_number: string;
    vehicle_photo_url: string | null;
    entry_time: string;
    exit_time: string | null;
    amount_paid_at_entry: number;
    payment_mode_at_entry: PaymentMode | null;
    amount_paid_at_exit: number | null;
    payment_mode_at_exit: PaymentMode | null;
    total_amount: number | null;
    recorded_by: string;
    exit_recorded_by: string | null;
    status: ParkingSession["status"];
    member_id: string | null;
  },
  profilesById: ProfilesById
): ParkingSession {
  return {
    id: row.id,
    tokenCode: row.ticket_code,
    vehicleTypeId: row.vehicle_type_id,
    vehicleNumber: row.vehicle_number,
    vehiclePhotoUrl: row.vehicle_photo_url ?? undefined,
    entryTime: row.entry_time,
    exitTime: row.exit_time ?? undefined,
    amountPaidAtEntry: row.amount_paid_at_entry,
    paymentModeAtEntry: row.payment_mode_at_entry ?? undefined,
    amountPaidAtExit: row.amount_paid_at_exit ?? undefined,
    paymentModeAtExit: row.payment_mode_at_exit ?? undefined,
    totalAmount: row.total_amount ?? undefined,
    recordedBy: nameFor(profilesById, row.recorded_by) ?? "Unknown",
    exitRecordedBy: nameFor(profilesById, row.exit_recorded_by),
    status: row.status,
    memberId: row.member_id ?? undefined,
  };
}

function mapExpenseRow(
  row: { id: string; amount: number; title: string; note: string | null; expense_date: string; recorded_by: string },
  profilesById: ProfilesById
): Expense {
  return {
    id: row.id,
    amount: row.amount,
    title: row.title,
    note: row.note ?? undefined,
    expenseDate: row.expense_date,
    recordedBy: nameFor(profilesById, row.recorded_by) ?? "Unknown",
  };
}

function mapMemberRow(
  row: {
    id: string;
    vehicle_number: string;
    vehicle_type_id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: Address | null;
    id_proof: IdProof | null;
    vehicle_photo_url: string | null;
    duration_months: number;
    fee_amount: number;
    start_date: string;
    expiry_date: string;
    recorded_by: string;
  },
  profilesById: ProfilesById
): Member {
  return {
    id: row.id,
    vehicleNumber: row.vehicle_number,
    vehicleTypeId: row.vehicle_type_id,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    customerAddress: row.customer_address ?? undefined,
    idProof: row.id_proof ?? undefined,
    vehiclePhotoUrl: row.vehicle_photo_url ?? undefined,
    durationMonths: row.duration_months,
    feeAmount: row.fee_amount,
    startDate: row.start_date,
    expiryDate: row.expiry_date,
    recordedBy: nameFor(profilesById, row.recorded_by) ?? "Unknown",
  };
}

function mapMemberPaymentRow(
  row: {
    id: string;
    member_id: string;
    amount: number;
    payment_mode: PaymentMode;
    paid_at: string;
    type: MemberPayment["type"];
    recorded_by: string;
  },
  profilesById: ProfilesById
): MemberPayment {
  return {
    id: row.id,
    memberId: row.member_id,
    amount: row.amount,
    paymentMode: row.payment_mode,
    paidAt: row.paid_at,
    type: row.type,
    recordedBy: nameFor(profilesById, row.recorded_by) ?? "Unknown",
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
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
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
  findMatchingMembers: (vehicleTypeId: string, vehicleNumber: string) => Member[];
  addMember: (input: AddMemberInput) => Promise<void>;
  renewMember: (memberId: string, durationMonths: number, paymentMode: PaymentMode) => Promise<void>;
  startSession: (
    vehicleTypeId: string,
    vehicleNumber: string,
    amountPaidAtEntry: number,
    paymentModeAtEntry?: PaymentMode,
    vehiclePhotoUrl?: string,
    memberId?: string
  ) => Promise<string>;
  completeSession: (id: string, paymentMode?: PaymentMode) => Promise<ParkingSession | null>;
  updateSessionVehicleNumber: (sessionId: string, vehicleNumber: string) => void;
  addExpense: (amount: number, title: string, note: string | undefined, expenseDate: string) => Promise<void>;
  updateExpense: (
    id: string,
    amount: number,
    title: string,
    note: string | undefined,
    expenseDate: string
  ) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  getSignedPhotoUrl: (path: string) => Promise<string | null>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>("employee");
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState<Address>({});
  const [phone, setPhone] = useState("");
  const [language, setLanguageState] = useState<Language>("en");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [profilesById, setProfilesById] = useState<ProfilesById>(new Map());

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, phone, address, role, business_id, language")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error("Failed to load profile after sign-in:", profileError);
      }

      if (!profile) {
        // Signed in but the profile/business setup never completed (or the
        // lookup failed — see console for the underlying error, if any).
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      setRole(profile.role);
      setUserName(profile.name);
      setUserAddress((profile.address as Address) ?? {});
      setPhone(profile.phone);
      setLanguageState((profile.language as Language) ?? "en");
      setBusinessId(profile.business_id);

      const [
        { data: business },
        { data: vts },
        { data: invites },
        { data: allProfiles },
        { data: sessionRows },
        { data: expenseRows },
        { data: memberRows },
        { data: paymentRows },
      ] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", profile.business_id).maybeSingle(),
        supabase.from("vehicle_types").select("*").eq("business_id", profile.business_id),
        supabase.from("team_invites").select("*").eq("business_id", profile.business_id).is("redeemed_at", null),
        supabase.from("profiles").select("id, name").eq("business_id", profile.business_id),
        supabase
          .from("parking_sessions")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("entry_time", { ascending: false }),
        supabase
          .from("expenses")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("expense_date", { ascending: false }),
        supabase.from("members").select("*").eq("business_id", profile.business_id),
        supabase
          .from("member_payments")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("paid_at", { ascending: false }),
      ]);

      if (!active) return;

      const freshProfilesById: ProfilesById = new Map((allProfiles ?? []).map((p) => [p.id, p.name]));
      setProfilesById(freshProfilesById);

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
      if (sessionRows) setSessions(sessionRows.map((r) => mapSessionRow(r, freshProfilesById)));
      if (expenseRows) setExpenses(expenseRows.map((r) => mapExpenseRow(r, freshProfilesById)));
      if (memberRows) setMembers(memberRows.map((r) => mapMemberRow(r, freshProfilesById)));
      if (paymentRows) setMemberPayments(paymentRows.map((r) => mapMemberPaymentRow(r, freshProfilesById)));

      setIsAuthenticated(true);
      setAuthChecked(true);
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED fires automatically roughly every hour during normal
      // use — it's the same user and business, just a renewed JWT. Treating
      // it like a fresh sign-in would re-fetch everything and show the
      // full-screen "checking session" spinner over whatever the attendant
      // was doing mid-use, for no reason.
      if (event === "TOKEN_REFRESHED") return;
      void loadForSession(session?.user.id ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const findMatchingMembers = (vehicleTypeId: string, vehicleNumber: string): Member[] => {
    const normalized = vehicleNumber.trim().toUpperCase();
    if (!normalized) return [];
    // Suffix match (not equality) so "last 4 digits" capture mode still
    // finds members, who are always stored with their full plate. In "full
    // number" mode this is equivalent to an exact match in practice.
    return members.filter(
      (m) =>
        m.vehicleTypeId === vehicleTypeId &&
        m.vehicleNumber.endsWith(normalized) &&
        new Date(m.expiryDate).getTime() >= Date.now()
    );
  };

  const value = useMemo<AppState>(
    () => ({
      authChecked,
      isAuthenticated,
      role,
      userName,
      userAddress,
      phone,
      language,
      setLanguage: (lang) => {
        setLanguageState(lang);
        void supabase.auth.getUser().then(({ data }) => {
          const userId = data.user?.id;
          if (!userId) return;
          void supabase
            .from("profiles")
            .update({ language: lang })
            .eq("id", userId)
            .select()
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) console.error("Failed to save language preference:", error);
              else if (!data) console.error("Language update matched no rows — userId:", userId);
            });
        });
      },
      t: (key) => translate(language, key),
      signup: async (newPhone, password, name) => {
        const email = phoneToEmail(newPhone);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          return error.message.toLowerCase().includes("already registered")
            ? translate(language, "phoneAlreadyRegistered")
            : error.message;
        }
        if (!data.session) {
          return translate(language, "accountCreationFailed");
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return false;
        // Confirm a profile actually exists before declaring success — don't
        // rely on the separate onAuthStateChange-driven load (elsewhere in
        // this file) to indirectly signal failure; that's a race, not a fact.
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();
        if (!profile) {
          await supabase.auth.signOut();
          return false;
        }
        return true;
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
          void supabase
            .from("profiles")
            .update({ name: trimmedName, address })
            .eq("id", userId)
            .select()
            .maybeSingle()
            .then(({ data: row, error }) => {
              if (error) console.error("Failed to save profile:", error);
              else if (!row) console.error("Profile update matched no rows — userId:", userId);
            });
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
          .then(({ data, error }) => {
            if (error) console.error("Failed to add team invite:", error);
            else if (data) setTeamInvites((prev) => [mapInviteRow(data), ...prev]);
          });
      },
      removeTeamInvite: (id) => {
        setTeamInvites((prev) => prev.filter((inv) => inv.id !== id));
        void supabase
          .from("team_invites")
          .delete()
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("Failed to remove team invite:", error);
          });
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
          .eq("id", businessId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save business details:", error);
            else if (!data) console.error("Business details update matched no rows — businessId:", businessId);
          });
      },
      vehicleNumberCaptureMode,
      setVehicleNumberCaptureMode: (mode) => {
        if (!businessId) return;
        setVehicleNumberCaptureModeState(mode);
        void supabase
          .from("businesses")
          .update({ vehicle_number_capture_mode: mode })
          .eq("id", businessId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save vehicle number capture mode:", error);
            else if (!data) console.error("Capture mode update matched no rows — businessId:", businessId);
          });
      },
      collectAtCheckIn,
      setCollectAtCheckIn: (value) => {
        if (!businessId) return;
        setCollectAtCheckInState(value);
        void supabase
          .from("businesses")
          .update({ collect_at_checkin: value })
          .eq("id", businessId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save collect-at-check-in setting:", error);
            else if (!data) console.error("Collect-at-check-in update matched no rows — businessId:", businessId);
          });
      },
      longStayThresholdHours,
      setLongStayThresholdHours: (hours) => {
        if (!businessId) return;
        setLongStayThresholdHoursState(hours);
        void supabase
          .from("businesses")
          .update({ long_stay_threshold_hours: hours })
          .eq("id", businessId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save long-stay threshold:", error);
            else if (!data) console.error("Long-stay threshold update matched no rows — businessId:", businessId);
          });
      },
      vehicleTypes,
      updateVehicleTypeSlotsAndSlabs: (vehicleTypeId, totalSlots, slabs) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, totalSlots, slabs } : vt))
        );
        void supabase
          .from("vehicle_types")
          .update({ total_slots: totalSlots, slabs })
          .eq("id", vehicleTypeId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save vehicle type slots/slabs:", error);
            else if (!data) console.error("Vehicle type slots/slabs update matched no rows — id:", vehicleTypeId);
          });
      },
      updateVehicleTypeMembershipPricing: (vehicleTypeId, pricing) => {
        setVehicleTypes((prev) =>
          prev.map((vt) => (vt.id === vehicleTypeId ? { ...vt, membershipPricing: pricing } : vt))
        );
        void supabase
          .from("vehicle_types")
          .update({ membership_pricing: pricing })
          .eq("id", vehicleTypeId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to save vehicle type membership pricing:", error);
            else if (!data) console.error("Vehicle type membership pricing update matched no rows — id:", vehicleTypeId);
          });
      },
      sessions,
      expenses,
      members,
      memberPayments,
      findMatchingMembers,
      addMember: async (input) => {
        const { data, error } = await supabase.rpc("add_member", {
          p_vehicle_number: input.vehicleNumber,
          p_vehicle_type_id: input.vehicleTypeId,
          p_customer_name: input.customerName ?? null,
          p_customer_phone: input.customerPhone ?? null,
          p_customer_address: input.customerAddress ?? null,
          p_id_proof: input.idProof ?? null,
          p_vehicle_photo_url: input.vehiclePhotoUrl ?? null,
          p_duration_months: input.durationMonths,
          p_payment_mode: input.paymentMode,
        });
        if (error || !data) {
          console.error("Failed to add member:", error);
          return;
        }
        setMembers((prev) => [mapMemberRow(data, profilesById), ...prev]);
        const { data: payment } = await supabase
          .from("member_payments")
          .select("*")
          .eq("member_id", data.id)
          .order("paid_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (payment) {
          setMemberPayments((prev) => [mapMemberPaymentRow(payment, profilesById), ...prev]);
        }
      },
      renewMember: async (memberId, durationMonths, paymentMode) => {
        const { data, error } = await supabase.rpc("renew_member", {
          p_member_id: memberId,
          p_duration_months: durationMonths,
          p_payment_mode: paymentMode,
        });
        if (error || !data) {
          console.error("Failed to renew member:", error);
          return;
        }
        const updated = mapMemberRow(data, profilesById);
        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        const { data: payment } = await supabase
          .from("member_payments")
          .select("*")
          .eq("member_id", memberId)
          .order("paid_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (payment) {
          setMemberPayments((prev) => [mapMemberPaymentRow(payment, profilesById), ...prev]);
        }
      },
      startSession: async (
        vehicleTypeId,
        vehicleNumber,
        amountPaidAtEntry,
        paymentModeAtEntry,
        vehiclePhotoUrl,
        memberId
      ) => {
        const { data, error } = await supabase.rpc("start_parking_session", {
          p_vehicle_type_id: vehicleTypeId,
          p_vehicle_number: vehicleNumber,
          p_amount_paid_at_entry: amountPaidAtEntry,
          p_payment_mode_at_entry: paymentModeAtEntry ?? null,
          p_vehicle_photo_url: vehiclePhotoUrl ?? null,
          p_member_id: memberId ?? null,
        });
        if (error || !data) {
          console.error("Failed to start parking session:", error);
          throw error ?? new Error("Failed to start session");
        }
        const newSession = mapSessionRow(data, profilesById);
        setSessions((prev) => [newSession, ...prev]);
        return newSession.tokenCode;
      },
      completeSession: async (id, paymentMode) => {
        const { data, error } = await supabase.rpc("complete_parking_session", {
          p_session_id: id,
          p_payment_mode: paymentMode ?? null,
        });
        if (error || !data) {
          console.error("Failed to complete parking session:", error);
          return null;
        }
        const updated = mapSessionRow(data, profilesById);
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return updated;
      },
      updateSessionVehicleNumber: (sessionId, vehicleNumber) => {
        const trimmed = vehicleNumber.trim().toUpperCase();
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, vehicleNumber: trimmed } : s)));
        void supabase
          .from("parking_sessions")
          .update({ vehicle_number: trimmed })
          .eq("id", sessionId)
          .select()
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error("Failed to update vehicle number:", error);
            else if (!data) console.error("Vehicle number update matched no rows — sessionId:", sessionId);
          });
      },
      addExpense: async (amount, title, note, expenseDate) => {
        if (!businessId) return;
        const { data, error } = await supabase
          .from("expenses")
          .insert({ business_id: businessId, amount, title, note: note ?? null, expense_date: expenseDate })
          .select()
          .single();
        if (error || !data) {
          console.error("Failed to add expense:", error);
          return;
        }
        setExpenses((prev) => [mapExpenseRow(data, profilesById), ...prev]);
      },
      updateExpense: async (id, amount, title, note, expenseDate) => {
        const { data, error } = await supabase
          .from("expenses")
          .update({ amount, title, note: note ?? null, expense_date: expenseDate })
          .eq("id", id)
          .select()
          .single();
        if (error || !data) {
          console.error("Failed to update expense:", error);
          return;
        }
        setExpenses((prev) => prev.map((e) => (e.id === id ? mapExpenseRow(data, profilesById) : e)));
      },
      uploadPhoto: async (file) => {
        if (!businessId) throw new Error("No business context");
        const compressed = await compressImage(file);
        const path = `${businessId}/${randomId()}.jpg`;
        const { error } = await supabase.storage.from("photos").upload(path, compressed, { contentType: "image/jpeg" });
        if (error) throw error;
        return path;
      },
      getSignedPhotoUrl: async (path) => {
        const { data, error } = await supabase.storage.from("photos").createSignedUrl(path, 3600);
        if (error || !data) return null;
        return data.signedUrl;
      },
    }),
    [
      authChecked,
      isAuthenticated,
      role,
      userName,
      userAddress,
      phone,
      language,
      businessId,
      profilesById,
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
