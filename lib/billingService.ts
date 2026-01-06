"use client";

import { useEffect, useRef, useCallback } from "react";

interface BillingSession {
  sessionId: string;
  clientId: string;
  advisorId: string;
  pricePerMinute: number;
  startTime: number;
  onBalanceWarning?: (type: "2-minute" | "1-minute" | "zero-balance") => void;
  onSessionPaused?: () => void;
  onUpdate?: (data: {
    elapsedSeconds: number;
    totalCharged: number;
    remainingBalance: number;
  }) => void;
}

class PerMinuteBillingService {
  private sessions: Map<string, BillingSession> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private balanceWarnings: Map<string, Set<string>> = new Map(); // sessionId -> warned types

  start(session: BillingSession) {
    this.sessions.set(session.sessionId, session);

    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.processBillingTick(), 1000);
    }
  }

  stop(sessionId: string) {
    this.sessions.delete(sessionId);
    this.balanceWarnings.delete(sessionId);

    if (this.sessions.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async processBillingTick() {
    for (const [sessionId, session] of this.sessions) {
      await this.billSession(session);
    }
  }

  private async billSession(session: BillingSession) {
    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const costPerSecond = session.pricePerMinute / 60;
    const totalCharged = elapsedSeconds * costPerSecond;

    try {
      // Get wallet balance
      const walletResponse = await fetch(
        `/api/wallet?userId=${session.clientId}`
      );
      const { balance } = await walletResponse.json();

      const remainingBalance = balance;
      const minutesRemaining = remainingBalance / session.pricePerMinute;

      // Check balance and emit warnings
      this.checkBalanceWarnings(session, minutesRemaining);

      // If balance exhausted, pause session
      if (remainingBalance < costPerSecond) {
        session.onSessionPaused?.();
        this.stop(session.sessionId);
        return;
      }

      // Deduct funds
      await fetch("/api/wallet/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.clientId,
          amount: costPerSecond,
          sessionId: session.sessionId,
          description: "Per-minute session billing",
        }),
      });

      // Update caller with current status
      session.onUpdate?.({
        elapsedSeconds,
        totalCharged,
        remainingBalance: remainingBalance - costPerSecond,
      });
    } catch (error) {
      console.error("Billing error:", error);
    }
  }

  private checkBalanceWarnings(
    session: BillingSession,
    minutesRemaining: number
  ) {
    if (!this.balanceWarnings.has(session.sessionId)) {
      this.balanceWarnings.set(session.sessionId, new Set());
    }

    const warned = this.balanceWarnings.get(session.sessionId)!;

    if (minutesRemaining <= 0) {
      if (!warned.has("zero-balance")) {
        session.onBalanceWarning?.("zero-balance");
        warned.add("zero-balance");
      }
    } else if (minutesRemaining <= 1) {
      if (!warned.has("1-minute")) {
        session.onBalanceWarning?.("1-minute");
        warned.add("1-minute");
      }
    } else if (minutesRemaining <= 2) {
      if (!warned.has("2-minute")) {
        session.onBalanceWarning?.("2-minute");
        warned.add("2-minute");
      }
    }
  }
}

export const billingService = new PerMinuteBillingService();

export function useBillingSession(
  sessionId: string,
  clientId: string,
  advisorId: string,
  pricePerMinute: number,
  onBalanceWarning?: (type: "2-minute" | "1-minute" | "zero-balance") => void,
  onSessionPaused?: () => void,
  onUpdate?: (data: {
    elapsedSeconds: number;
    totalCharged: number;
    remainingBalance: number;
  }) => void
) {
  const sessionRef = useRef<BillingSession | null>(null);

  useEffect(() => {
    sessionRef.current = {
      sessionId,
      clientId,
      advisorId,
      pricePerMinute,
      startTime: Date.now(),
      onBalanceWarning,
      onSessionPaused,
      onUpdate,
    };

    billingService.start(sessionRef.current);

    return () => {
      if (sessionRef.current) {
        billingService.stop(sessionRef.current.sessionId);
      }
    };
  }, [sessionId, clientId, advisorId, pricePerMinute, onBalanceWarning, onSessionPaused, onUpdate]);

  const pause = useCallback(() => {
    if (sessionRef.current) {
      // Send pause command to server
      fetch("/api/sessions/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
  }, [sessionId]);

  const resume = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.startTime = Date.now();
      fetch("/api/sessions/pause", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
  }, [sessionId]);

  const end = useCallback(async (duration: number, totalCharged: number) => {
    if (sessionRef.current) {
      billingService.stop(sessionId);

      await fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          durationSeconds: duration,
          totalCharged,
          advisorEarning: totalCharged * 0.9,
        }),
      });
    }
  }, [sessionId]);

  return { pause, resume, end };
}
