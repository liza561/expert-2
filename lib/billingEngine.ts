import { ConvexClient } from "convex/browser";

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Session billing management
export async function startBillingSession(
  sessionId: string,
  clientId: string,
  pricePerMinute: number
) {
  return await client.mutation("sessions:startSession", {
    sessionId,
    clientId,
    pricePerMinute,
  });
}

// Deduct funds every second
export async function processBillingTick(
  sessionId: string,
  clientId: string,
  pricePerMinute: number
): Promise<{
  success: boolean;
  newBalance?: number;
  shouldPause?: boolean;
  warning?: string;
}> {
  const costPerSecond = pricePerMinute / 60;

  // Get current wallet
  const wallet = await client.query("wallet:getWallet", { userId: clientId });

  if (!wallet) {
    return { success: false };
  }

  // Check for low balance warnings
  const minutesRemaining = wallet.balance / pricePerMinute;

  if (minutesRemaining <= 1 && minutesRemaining > 0.5) {
    // 1-minute warning
    await client.mutation("sessions:logBalanceWarning", {
      sessionId,
      userId: clientId,
      warningType: "1-minute",
      remainingBalance: wallet.balance,
    });

    return { success: true, newBalance: wallet.balance, warning: "1-minute" };
  } else if (minutesRemaining <= 2 && minutesRemaining > 1) {
    // 2-minute warning
    await client.mutation("sessions:logBalanceWarning", {
      sessionId,
      userId: clientId,
      warningType: "2-minute",
      remainingBalance: wallet.balance,
    });

    return { success: true, newBalance: wallet.balance, warning: "2-minute" };
  }

  // Deduct funds
  if (wallet.balance >= costPerSecond) {
    const result = await client.mutation("wallet:deductFunds", {
      userId: clientId,
      amount: costPerSecond,
      sessionId,
      description: `Session billing - ${pricePerMinute}/min`,
    });

    if (result.success) {
      return {
        success: true,
        newBalance: result.newBalance,
      };
    }
  }

  // Zero balance
  if (wallet.balance < costPerSecond) {
    await client.mutation("sessions:logBalanceWarning", {
      sessionId,
      userId: clientId,
      warningType: "zero-balance",
      remainingBalance: wallet.balance,
    });

    return {
      success: false,
      shouldPause: true,
      warning: "zero-balance",
    };
  }

  return { success: false };
}

// End session and calculate totals
export async function endBillingSession(
  sessionId: string,
  durationSeconds: number,
  pricePerMinute: number,
  clientWalletBefore: number
) {
  const totalCharged = (durationSeconds / 60) * pricePerMinute;
  const advisorEarning = totalCharged * 0.9; // 10% platform fee

  // Get current wallet balance
  const session = await client.query("sessions:getSession", { sessionId });

  return {
    durationSeconds,
    totalCharged,
    advisorEarning,
    clientWalletBefore,
    clientWalletAfter: session?.clientWalletAfter || 0,
  };
}

export default client;
