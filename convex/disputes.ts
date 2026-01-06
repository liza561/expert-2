import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create dispute
export const createDispute = mutation({
  args: {
    sessionId: v.string(),
    clientId: v.string(),
    advisorId: v.string(),
    reason: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { sessionId, clientId, advisorId, reason, description }) => {
    const disputeId = await ctx.db.insert("disputes", {
      sessionId,
      clientId,
      advisorId,
      reason,
      description,
      status: "open",
      createdAt: Date.now(),
    });

    return disputeId;
  },
});

// Get disputes
export const getDisputes = query({
  args: { sessionId: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, { sessionId, status }) => {
    let disputes: any[] = [];

    if (sessionId) {
      disputes = await ctx.db
        .query("disputes")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
        .collect();
    } else {
      disputes = await ctx.db.query("disputes").collect();
    }

    if (status) {
      disputes = disputes.filter((d) => d.status === status);
    }

    return disputes;
  },
});

// Update dispute status
export const updateDisputeStatus = mutation({
  args: {
    disputeId: v.id("disputes"),
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    resolution: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
  },
  handler: async (ctx, { disputeId, status, resolution, refundAmount }) => {
    const dispute = await ctx.db.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");

    const updates: any = {
      status,
      resolvedAt: Date.now(),
    };

    if (resolution) updates.resolution = resolution;
    if (refundAmount !== undefined) updates.refundAmount = refundAmount;

    await ctx.db.patch(disputeId, updates);

    // If refund is issued, update client wallet
    if (refundAmount && refundAmount > 0) {
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", dispute.clientId))
        .first();

      if (wallet) {
        const newBalance = wallet.balance + refundAmount;
        await ctx.db.patch(wallet._id, {
          balance: newBalance,
          updatedAt: Date.now(),
        });

        // Create transaction record
        await ctx.db.insert("transactions", {
          userId: dispute.clientId,
          type: "refund",
          amount: refundAmount,
          balance: newBalance,
          description: `Refund for dispute on session ${dispute.sessionId}`,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Get user disputes
export const getUserDisputes = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const allDisputes = await ctx.db.query("disputes").collect();

    return allDisputes.filter(
      (d) => d.clientId === userId || d.advisorId === userId
    );
  },
});
