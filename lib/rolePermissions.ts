// Role and permission checks
export type UserRole = "client" | "advisor" | "admin";

export function canAccessAdminPanel(role: UserRole): boolean {
  return role === "admin";
}

export function canSetPricing(role: UserRole): boolean {
  return role === "advisor";
}

export function canStartSession(role: UserRole): boolean {
  return role === "client";
}

export function canReceiveEarnings(role: UserRole): boolean {
  return role === "advisor";
}

export function getDefaultRole(): UserRole {
  return "client";
}

export function isAdvisor(role: UserRole): boolean {
  return role === "advisor";
}

export function isClient(role: UserRole): boolean {
  return role === "client";
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}
