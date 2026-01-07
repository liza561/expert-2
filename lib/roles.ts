// Canonical roles – MUST match Clerk publicMetadata.role
export const ROLES = ["user", "advisor", "admin"] as const;

export type Role = typeof ROLES[number];

// ----------------------
// Role Guards
// ----------------------

export function isAdmin(role?: Role | null): boolean {
  return role === "admin";
}

export function isAdvisor(role?: Role | null): boolean {
  return role === "advisor";
}

export function isUser(role?: Role | null): boolean {
  return role === "user";
}

// ----------------------
// Permissions
// ----------------------

export function canAccessAdminPanel(role?: Role | null): boolean {
  return isAdmin(role);
}

export function canSetPricing(role?: Role | null): boolean {
  return isAdvisor(role);
}

export function canStartSession(role?: Role | null): boolean {
  return isUser(role);
}

export function canReceiveEarnings(role?: Role | null): boolean {
  return isAdvisor(role);
}

// ----------------------
// Defaults & Safety
// ----------------------

export function getDefaultRole(): Role {
  return "user";
}

export function normalizeRole(role: unknown): Role {
  if (ROLES.includes(role as Role)) return role as Role;
  return getDefaultRole();
}
