import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to create wallet
const createWallet = async (ctx: any, userId: string) => {
  const walletId = await ctx.db.insert("wallets", {
    userId,
    balance: 0,
    currency: "USD",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const wallet = await ctx.db.get(walletId);
  return wallet;
};

// Get wallet balance
export const getWallet = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      // Wallet doesn't exist yet - client should handle creation
      // Return null and let client request the mutation if needed
      return null;
    }

    return wallet;
  },
});

// Add funds to wallet
export const addFunds = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, { userId, amount, description }) => {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId,
        balance: 0,
        currency: "USD",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newWallet = await ctx.db.get(walletId);
      if (!newWallet) {
        throw new Error("Failed to create wallet");
      }
      wallet = newWallet;
    }

    const newBalance = wallet.balance + amount;

    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: Date.now(),
    });

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId,
      type: "add",
      amount,
      balance: newBalance,
      description,
      createdAt: Date.now(),
    });

    return { success: true, newBalance };
  },
});

// Deduct funds (for per-minute billing)
export const deductFunds = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    sessionId: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { userId, amount, sessionId, description }) => {
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      return { success: false, reason: "Insufficient balance" };
    }

    const newBalance = wallet.balance - amount;

    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: Date.now(),
    });

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId,
      type: "deduct",
      amount,
      balance: newBalance,
      sessionId,
      description,
      createdAt: Date.now(),
    });

    return { success: true, newBalance };
  },
});

// Get transaction history
export const getTransactionHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 50 }) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Get transaction history with session details
export const getTransactionHistoryWithDetails = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    return Promise.all(
      transactions.map(async (transaction) => {
        let sessionDetails = null;
        if (transaction.sessionId) {
          // Cast sessionId string to proper Id type
          try {
            sessionDetails = await ctx.db.get(transaction.sessionId as any);
          } catch (error) {
            // Session details not found
            sessionDetails = null;
          }
        }
        return { ...transaction, sessionDetails };
      })
    );
  },
});

// Check if wallet has minimum balance for session
export const hasMinimumBalance = query({
  args: { userId: v.string(), minimumRequired: v.number() },
  handler: async (ctx, { userId, minimumRequired }) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) return false;
    return wallet.balance >= minimumRequired;
  },
});
