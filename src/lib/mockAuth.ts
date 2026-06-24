import { Role } from "./types";

export interface DeviceAccount {
  phone: string;
  password: string; // 6-digit numeric — no backend yet, stored locally only
  role: Role;
  name: string;
}

const ACCOUNT_STORAGE_KEY = "parkesy-account";

// No backend yet — this heuristic stands in for how the real signup would
// assign a role (today: Owner creates the location, Employees get invited).
// 9999999999 resolves to Owner so the two personas can still be tested.
export function resolveRole(phone: string): { role: Role; name: string } {
  return phone === "9999999999" ? { role: "owner", name: "Owner" } : { role: "employee", name: "Employee" };
}

export function getDeviceAccount(): DeviceAccount | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeviceAccount) : null;
  } catch {
    return null;
  }
}

export function createDeviceAccount(phone: string, password: string): DeviceAccount {
  const { role, name } = resolveRole(phone);
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

export function checkPassword(password: string): boolean {
  return getDeviceAccount()?.password === password;
}
