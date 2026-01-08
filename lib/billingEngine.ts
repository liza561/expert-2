import { ConvexClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const client = new ConvexClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);


// --------------------
// Start billing session
// --------------------
export async function startBillingSession(
  sessionId: string,
  userId: string,
  pricePerMinute: number
) {
  return client.mutation(api.sessions.createSession, {
    sessionId,
    userId,
    pricePerMinute,
    userWalletBefore: 0,
    advisorId: "advisorId",
    type: "chat",
  });
}

// --------------------
// Billing tick
// --------------------
export async function processBillingTick(
  sessionId: string,
  userId: string,
  pricePerMinute: number
): Promise<{
  success: boolean;
  newBalance?: number;
  shouldPause?: boolean;
  warning?: string;
}> {
  const costPerSecond = pricePerMinute / 60;

  const wallet = await client.query(api.wallet.getWallet, { userId });

  if (!wallet) return { success: false };

  const minutesRemaining = wallet.balance / pricePerMinute;

  if (minutesRemaining <= 1 && minutesRemaining > 0.5) {
    await client.mutation(api.sessions.logBalanceWarning, {
      sessionId,
      userId,
      warningType: "1-minute",
      remainingBalance: wallet.balance,
    });

    return { success: true, newBalance: wallet.balance, warning: "1-minute" };
  }

  if (minutesRemaining <= 2 && minutesRemaining > 1) {
    await client.mutation(api.sessions.logBalanceWarning, {
      sessionId,
      userId,
      warningType: "2-minute",
      remainingBalance: wallet.balance,
    });

    return { success: true, newBalance: wallet.balance, warning: "2-minute" };
  }

  if (wallet.balance >= costPerSecond) {
    const result = await client.mutation(api.wallet.deductFunds, {
      userId,
      amount: costPerSecond,
      sessionId,
      description: `Session billing - ${pricePerMinute}/min`,
    });

    if (result?.success) {
      return { success: true, newBalance: result.newBalance };
    }
  }

  await client.mutation(api.sessions.logBalanceWarning, {
    sessionId,
    userId,
    warningType: "zero-balance",
    remainingBalance: wallet.balance,
  });

  return { success: false, shouldPause: true, warning: "zero-balance" };
}

// --------------------
// End billing session
// --------------------
export async function endBillingSession(
  sessionId: Id<"sessions">,
  durationSeconds: number,
  pricePerMinute: number,
  userWalletBefore: number
) {
  const totalCharged = (durationSeconds / 60) * pricePerMinute;
  const advisorEarning = totalCharged * 0.9;

  const session = await client.query(api.sessions.getSession, {
    sessionId,
});
  return {
    durationSeconds,
    totalCharged,
    advisorEarning,
    userWalletBefore,
    userWalletAfter: session?.userWalletAfter ?? 0,
  };
}

export default client;
