import { Address, Role } from "./types";

export interface DeviceAccount {
  phone: string;
  password: string; // 6-digit numeric — no backend yet, stored locally only
  role: Role;
  name: string;
  address?: Address;
}

const ACCOUNT_STORAGE_KEY = "parkesy-account";

// No backend yet — this heuristic stands in for how the real signup would
// assign a role when there's no team invite for the phone number entered.
// Whoever signs up first (no invite) is the founder/admin.
// 8888888888 resolves to Employee so that persona can still be tested.
export function resolveRole(phone: string): Role {
  return phone === "8888888888" ? "employee" : "admin";
}

export function getDeviceAccount(): DeviceAccount | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeviceAccount) : null;
  } catch {
    return null;
  }
}

export function createDeviceAccount(phone: string, password: string, name: string, role: Role): DeviceAccount {
  const account: DeviceAccount = { phone, password, role, name };
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function updateDevicePassword(newPassword: string): DeviceAccount | null {
  const account = getDeviceAccount();
  if (!account) return null;
  const updated = { ...account, password: newPassword };
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateDeviceProfile(name: string, address: Address): DeviceAccount | null {
  const account = getDeviceAccount();
  if (!account) return null;
  const updated = { ...account, name, address };
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function checkPassword(password: string): boolean {
  return getDeviceAccount()?.password === password;
}
