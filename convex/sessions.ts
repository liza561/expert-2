import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create or get session
export const createSession = mutation({
  args: {
    clientId: v.string(),
    advisorId: v.string(),
    type: v.union(v.literal("chat"), v.literal("video")),
    pricePerMinute: v.number(),
    clientWalletBefore: v.number(),
  },
  handler: async (
    ctx,
    { clientId, advisorId, type, pricePerMinute, clientWalletBefore }
  ) => {
    const now = Date.now();

    const sessionId = await ctx.db.insert("sessions", {
      clientId,
      advisorId,
      type,
      status: "active",
      pricePerMinute,
      startTime: now,
      totalDurationSeconds: 0,
      totalCharged: 0,
      clientWalletBefore,
      clientWalletAfter: clientWalletBefore,
      advisorEarning: 0,
      lastActivityTime: now,
      createdAt: now,
    });

    return sessionId;
  },
});

// Get active session
export const getActiveSession = query({
  args: { clientId: v.string(), advisorId: v.string() },
  handler: async (ctx, { clientId, advisorId }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .collect();
    
    return sessions.find(
      (session) =>
        session.advisorId === advisorId &&
        (session.status === "active" || session.status === "paused")
    );
  },
});

// Get session by ID
export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db.get(sessionId);
  },
});

// Get all sessions for user (client/advisor)
export const getSessions = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 50 }) => {
    const allSessions = await ctx.db
      .query("sessions")
      .collect();

    const filtered = allSessions.filter(
      (s) => (s.clientId === userId || s.advisorId === userId)
    );

    return filtered.slice(0, limit);
  },
});

// Get advisor sessions
export const getAdvisorSessions = query({
  args: { advisorId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { advisorId, status }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    if (status) {
      return sessions.filter((s) => s.status === status);
    }
    return sessions;
  },
});

// Get client sessions
export const getClientSessions = query({
  args: { clientId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { clientId, status }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .collect();

    if (status) {
      return sessions.filter((s) => s.status === status);
    }
    return sessions;
  },
});

// Update session - for per-minute billing
export const updateSessionBilling = mutation({
  args: {
    sessionId: v.id("sessions"),
    durationSeconds: v.number(),
    amountCharged: v.number(),
    clientWalletAfter: v.number(),
    advisorEarning: v.number(),
  },
  handler: async (
    ctx,
    { sessionId, durationSeconds, amountCharged, clientWalletAfter, advisorEarning }
  ) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(sessionId, {
      totalDurationSeconds: durationSeconds,
      totalCharged: amountCharged,
      clientWalletAfter,
      advisorEarning,
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

// Pause session
export const pauseSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(sessionId, {
      status: "paused",
      pausedAt: Date.now(),
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

// Resume session
export const resumeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(sessionId, {
      status: "active",
      pausedAt: undefined,
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

// End session
export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    finalDurationSeconds: v.number(),
    totalCharged: v.number(),
    clientWalletAfter: v.number(),
    advisorEarning: v.number(),
  },
  handler: async (
    ctx,
    { sessionId, finalDurationSeconds, totalCharged, clientWalletAfter, advisorEarning }
  ) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const now = Date.now();

    await ctx.db.patch(sessionId, {
      status: "completed",
      endTime: now,
      totalDurationSeconds: finalDurationSeconds,
      totalCharged,
      clientWalletAfter,
      advisorEarning,
      lastActivityTime: now,
    });

    // Create advisor earning record
    await ctx.db.insert("earnings", {
      advisorId: session.advisorId,
      sessionId,
      amount: advisorEarning,
      durationSeconds: finalDurationSeconds,
      clientId: session.clientId,
      type: session.type,
      status: "completed",
      createdAt: now,
    });

    return { success: true, session };
  },
});

// Cancel session
export const cancelSession = mutation({
  args: { sessionId: v.id("sessions"), reason: v.optional(v.string()) },
  handler: async (ctx, { sessionId, reason }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(sessionId, {
      status: "cancelled",
      endTime: Date.now(),
      lastActivityTime: Date.now(),
    });

    return { success: true };
  },
});

// Add document to session
export const addDocumentToSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    documentId: v.string(),
  },
  handler: async (ctx, { sessionId, documentId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const documents = session.documents || [];
    documents.push(documentId);

    await ctx.db.patch(sessionId, { documents });

    return { success: true };
  },
});

// Rate session
export const rateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    rating: v.number(),
    feedback: v.string(),
    clientId: v.string(),
    advisorId: v.string(),
  },
  handler: async (ctx, { sessionId, rating, feedback, clientId, advisorId }) => {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    // Update session with rating
    await ctx.db.patch(sessionId, {
      rating,
      feedback,
    });

    // Create rating record
    const ratingId = await ctx.db.insert("ratings", {
      sessionId,
      clientId,
      advisorId,
      rating,
      feedback,
      createdAt: Date.now(),
    });

    // Update advisor profile average rating
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_advisorId", (q) => q.eq("advisorId", advisorId))
      .collect();

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    const profile = await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", advisorId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        averageRating,
        totalRatings: ratings.length,
      });
    }

    return { success: true, ratingId };
  },
});

// Log balance warning
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
  handler: async (ctx, { sessionId, userId, warningType, remainingBalance }) => {
    await ctx.db.insert("balanceWarnings", {
      sessionId,
      userId,
      warningType,
      remainingBalance,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
