import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get advisor earnings
export const getAdvisorEarnings = query({
  args: { advisorId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { advisorId, status }) => {
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    if (status) {
      return earnings.filter((e) => e.status === status);
    }
    return earnings;
  },
});

// Get earnings summary for advisor
export const getEarningsSummary = query({
  args: { advisorId: v.string() },
  handler: async (ctx, { advisorId }) => {
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    const completed = earnings.filter((e) => e.status === "completed");
    const pending = earnings.filter((e) => e.status === "pending");
    const withdrawn = earnings.filter((e) => e.status === "withdrawn");

    const totalCompleted = completed.reduce((sum, e) => sum + e.amount, 0);
    const totalPending = pending.reduce((sum, e) => sum + e.amount, 0);
    const totalWithdrawn = withdrawn.reduce((sum, e) => sum + e.amount, 0);

    const totalSessions = earnings.length;
    const totalHours = earnings.reduce((sum, e) => sum + e.durationSeconds, 0) / 3600;

    return {
      totalCompleted,
      totalPending,
      totalWithdrawn,
      totalEarnings: totalCompleted + totalWithdrawn,
      totalSessions,
      totalHours,
      availableForWithdrawal: totalCompleted,
    };
  },
});

// Mark earnings as withdrawn
export const markEarningsWithdrawn = mutation({
  args: {
    advisorId: v.string(),
    earningIds: v.array(v.id("earnings")),
  },
  handler: async (ctx, { advisorId, earningIds }) => {
    const now = Date.now();

    for (const earningId of earningIds) {
      const earning = await ctx.db.get(earningId);
      if (earning && earning.advisorId === advisorId) {
        await ctx.db.patch(earningId, {
          status: "withdrawn",
          withdrawnAt: now,
        });
      }
    }

    return { success: true };
  },
});

// Get session earnings
export const getSessionEarnings = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    return earnings;
  },
});
