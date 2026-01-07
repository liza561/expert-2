import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ----------------------------- CONSTANTS ----------------------------- */

const sessionStatus = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("cancelled")
);

/* --------------------------- CREATE SESSION --------------------------- */

export const createSession = mutation({
  args: {
    clientId: v.string(),
    advisorId: v.string(),
    type: v.union(v.literal("chat"), v.literal("video")),
    pricePerMinute: v.number(),
    clientWalletBefore: v.number(),
  },
  handler: async (ctx, args) => {
    const now: number = Date.now();

    return await ctx.db.insert("sessions", {
      ...args,
      status: "active",
      startTime: now,
      totalDurationSeconds: 0,
      totalCharged: 0,
      clientWalletAfter: args.clientWalletBefore,
      advisorEarning: 0,
      lastActivityTime: now,
      createdAt: now,
      documents: [] as string[],
    });
  },
});

/* -------------------------- GET ACTIVE SESSION ------------------------- */

export const getActiveSession = query({
  args: {
    clientId: v.string(),
    advisorId: v.string(),
  },
  handler: async (ctx, { clientId, advisorId }) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(
          q.eq(q.field("advisorId"), advisorId),
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "paused")
          )
        )
      )
      .first();
  },
});

/* ----------------------------- GET SESSION ---------------------------- */

export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => ctx.db.get(sessionId),
});

// Add this to your sessions.ts
export const getSessionById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return null;

    // Get Advisor name from the users table
    const advisor = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", session.advisorId))
      .first();

    return {
      ...session,
      advisorName: advisor?.name || "Advisor",
    };
  },
});



/* ---------------------------- USER SESSIONS --------------------------- */

export const getSessions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    const sessions = await ctx.db.query("sessions").collect();
    return sessions
      .filter((s) => s.clientId === userId || s.advisorId === userId)
      .slice(0, limit);
  },
});

/* --------------------------- ADVISOR SESSIONS -------------------------- */

export const getAdvisorSessions = query({
  args: {
    advisorId: v.string(),
    status: v.optional(sessionStatus),
  },
  handler: async (ctx, { advisorId, status }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    return status ? sessions.filter((s) => s.status === status) : sessions;
  },
});

/* ---------------------------- CLIENT SESSIONS -------------------------- */

export const getClientSessions = query({
  args: {
    clientId: v.string(),
    status: v.optional(sessionStatus),
  },
  handler: async (ctx, { clientId, status }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .collect();

    return status ? sessions.filter((s) => s.status === status) : sessions;
  },
});

/* ----------------------- UPDATE BILLING (PER MIN) ---------------------- */

export const updateSessionBilling = mutation({
  args: {
    sessionId: v.id("sessions"),
    durationSeconds: v.number(),
    amountCharged: v.number(),
    clientWalletAfter: v.number(),
    advisorEarning: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      totalDurationSeconds: args.durationSeconds,
      totalCharged: args.amountCharged,
      clientWalletAfter: args.clientWalletAfter,
      advisorEarning: args.advisorEarning,
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

/* ----------------------------- PAUSE SESSION --------------------------- */

export const pauseSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const now: number = Date.now();
    await ctx.db.patch(sessionId, {
      status: "paused",
      pausedAt: now,
      lastActivityTime: now,
    });

    return { success: true };
  },
});

/* ---------------------------- RESUME SESSION --------------------------- */

export const resumeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.db.patch(sessionId, {
      status: "active",
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

/* ----------------------------- END SESSION ----------------------------- */

export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    finalDurationSeconds: v.number(),
    totalCharged: v.number(),
    clientWalletAfter: v.number(),
    advisorEarning: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const now: number = Date.now();

    await ctx.db.patch(args.sessionId, {
      status: "completed",
      endTime: now,
      totalDurationSeconds: args.finalDurationSeconds,
      totalCharged: args.totalCharged,
      clientWalletAfter: args.clientWalletAfter,
      advisorEarning: args.advisorEarning,
      lastActivityTime: now,
    });

    await ctx.db.insert("earnings", {
      advisorId: session.advisorId,
      sessionId: args.sessionId,
      amount: args.advisorEarning,
      durationSeconds: args.finalDurationSeconds,
      clientId: session.clientId,
      type: session.type,
      status: "completed",
      createdAt: now,
    });

    return { success: true };
  },
});

/* ---------------------------- CANCEL SESSION --------------------------- */

export const cancelSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId }) => {
    const now: number = Date.now();
    await ctx.db.patch(sessionId, {
      status: "cancelled",
      endTime: now,
      lastActivityTime: now,
    });

    return { success: true };
  },
});

/* ------------------------- ADD DOCUMENT TO SESSION --------------------- */

export const addDocumentToSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    documentId: v.string(),
  },
  handler: async (ctx, { sessionId, documentId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(sessionId, {
      documents: [...(session.documents ?? []), documentId],
    });

    return { success: true };
  },
});

/* ------------------------------ RATE SESSION --------------------------- */

export const rateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    clientId: v.string(),
    advisorId: v.string(),
    rating: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5)
      throw new Error("Rating must be between 1 and 5");

    await ctx.db.patch(args.sessionId, {
      rating: args.rating,
      feedback: args.feedback,
    });

    const now: number = Date.now();

    await ctx.db.insert("ratings", {
      sessionId: args.sessionId,
      clientId: args.clientId,
      advisorId: args.advisorId,
      rating: args.rating,
      feedback: args.feedback,
      createdAt: now,
    });

    // Update advisor profile rating
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", args.advisorId))
      .collect();

    const averageRating =
      ratings.length === 0
        ? 0
        : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    const profile = await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.advisorId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        averageRating,
        totalRatings: ratings.length,
      });
    }

    return { success: true };
  },
});

/* --------------------------- BALANCE WARNINGS -------------------------- */

export const logBalanceWarning = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
    warningType: v.union(
      v.literal("2-minute"),
      v.literal("1-minute"),
      v.literal("zero-balance")
    ),
    remainingBalance: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("balanceWarnings", {
      ...args,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});


