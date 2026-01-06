import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create payout request
export const createPayoutRequest = mutation({
  args: {
    advisorId: v.string(),
    amount: v.number(),
    method: v.union(
    v.literal("stripe"),
    v.literal("paypal"),
    v.literal("bank")
  ),
    bankDetails: v.object({
      accountName: v.string(),
      accountNumber: v.string(),
      bankName: v.string(),
    }),
  },
  handler: async (ctx, { advisorId, amount, method, bankDetails }) => {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const payoutId = await ctx.db.insert("payoutRequests", {
      advisorId,
      amount,
      method,
      status: "pending",
      bankDetails,
      requestedAt: Date.now(),
    });

    return payoutId;
  },
});

// Get payout requests
export const getPayoutRequests = query({
  args: { advisorId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { advisorId, status }) => {
    const requests = await ctx.db
      .query("payoutRequests")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    if (status) {
      return requests.filter((r) => r.status === status);
    }
    return requests;
  },
});

// Approve payout request (admin only)
export const approvePayoutRequest = mutation({
  args: { payoutId: v.id("payoutRequests") },
  handler: async (ctx, { payoutId }) => {
    const payout = await ctx.db.get(payoutId);
    if (!payout) throw new Error("Payout request not found");

    await ctx.db.patch(payoutId, {
      status: "approved",
    });

    return { success: true };
  },
});

// Complete payout request (admin only)
export const completePayoutRequest = mutation({
  args: { payoutId: v.id("payoutRequests") },
  handler: async (ctx, { payoutId }) => {
    const payout = await ctx.db.get(payoutId);
    if (!payout) throw new Error("Payout request not found");

    await ctx.db.patch(payoutId, {
      status: "completed",
      processedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reject payout request (admin only)
export const rejectPayoutRequest = mutation({
  args: { payoutId: v.id("payoutRequests"), reason: v.string() },
  handler: async (ctx, { payoutId, reason }) => {
    const payout = await ctx.db.get(payoutId);
    if (!payout) throw new Error("Payout request not found");

    await ctx.db.patch(payoutId, {
      status: "rejected",
      reason,
      processedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all pending payout requests (admin only)
export const getAllPendingPayouts = query({
  args: {},
  handler: async (ctx) => {
    const payouts = await ctx.db
      .query("payoutRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return payouts;
  },
});
