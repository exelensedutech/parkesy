import { Role, TeamInvite } from "./types";

const TEAM_INVITES_KEY = "parkesy-team-invites";

export function getTeamInvites(): TeamInvite[] {
  try {
    const raw = window.localStorage.getItem(TEAM_INVITES_KEY);
    return raw ? (JSON.parse(raw) as TeamInvite[]) : [];
  } catch {
    return [];
  }
}

function saveTeamInvites(invites: TeamInvite[]): void {
  window.localStorage.setItem(TEAM_INVITES_KEY, JSON.stringify(invites));
}

export function addTeamInvite(name: string, phone: string, pin: string, role: Role): TeamInvite {
  const invite: TeamInvite = {
    id: `inv${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    pin,
    role,
    createdAt: new Date().toISOString(),
  };
  saveTeamInvites([invite, ...getTeamInvites()]);
  return invite;
}

export function removeTeamInvite(id: string): void {
  saveTeamInvites(getTeamInvites().filter((inv) => inv.id !== id));
}
