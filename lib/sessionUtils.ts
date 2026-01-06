// Session and billing utilities

export interface SessionSummary {
  durationSeconds: number;
  durationMinutes: number;
  totalCharged: number;
  advisorEarning: number;
  platformFee: number;
  clientWalletBefore: number;
  clientWalletAfter: number;
}

export function calculateSessionSummary(
  durationSeconds: number,
  pricePerMinute: number,
  clientWalletBefore: number,
  clientWalletAfter: number
): SessionSummary {
  const durationMinutes = durationSeconds / 60;
  const totalCharged = durationMinutes * pricePerMinute;
  const platformFee = totalCharged * 0.1; // 10% fee
  const advisorEarning = totalCharged - platformFee;

  return {
    durationSeconds,
    durationMinutes,
    totalCharged,
    advisorEarning,
    platformFee,
    clientWalletBefore,
    clientWalletAfter,
  };
}

export function getMinutesRemaining(balance: number, pricePerMinute: number): number {
  if (pricePerMinute <= 0) return 0;
  return balance / pricePerMinute;
}

export function getMinimumBalanceRequired(
  pricePerMinute: number,
  minMinutes: number = 3
): number {
  return pricePerMinute * minMinutes;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  return `${symbol}${amount.toFixed(2)}`;
}

export type SessionStatus =
  | "pending"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export function canPauseSession(status: SessionStatus): boolean {
  return status === "active";
}

export function canResumeSession(status: SessionStatus): boolean {
  return status === "paused";
}

export function canEndSession(status: SessionStatus): boolean {
  return status === "active" || status === "paused";
}
