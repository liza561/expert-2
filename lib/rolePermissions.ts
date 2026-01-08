// Role and permission checks
export type ROLES = "user" | "advisor" | "admin";

export function canAccessAdminPanel(role: ROLES): boolean {
  return role === "admin";
}

export function canSetPricing(role: ROLES): boolean {
  return role === "advisor";
}

export function canStartSession(role: ROLES): boolean {
  return role === "user";
}

export function canReceiveEarnings(role: ROLES): boolean {
  return role === "advisor";
}

export function getDefaultRole(): ROLES {
  return "user";
}

export function isAdvisor(role: ROLES): boolean {
  return role === "advisor";
}

export function isUser(role: ROLES): boolean {
  return role === "user";
}

export function isAdmin(role: ROLES): boolean {
  return role === "admin";
}
