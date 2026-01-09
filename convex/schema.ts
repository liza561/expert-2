import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    userName: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    imageURL: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("advisor"), v.literal("admin"))),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Advisor profiles with pricing and availability
  advisorProfiles: defineTable({
    userId: v.string(),
    bio: v.string(),
    specialization: v.array(v.string()),
    chatPricePerMinute: v.number(),
    videoPricePerMinute: v.number(),
    availabilityHours: v.object({
      startTime: v.string(), // HH:mm format
      endTime: v.string(),
      daysOfWeek: v.array(v.string()), // Monday, Tuesday, etc.
    }),
    profileCompletion: v.number(), // 0-100 percentage
    averageRating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Wallet - stores balance for users and advisors
  wallets: defineTable({
    userId: v.string(),
    balance: v.number(),
    currency: v.string(), // USD, EUR, etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Session records - tracks all chat/video sessions
  sessions: defineTable({
    userId: v.string(),
    userName: v.optional(v.string()),
    advisorId: v.string(),
    durationMinutes: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    type: v.union(v.literal("chat"), v.literal("video")),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    pricePerMinute: v.number(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    pausedAt: v.optional(v.number()),
    totalDurationSeconds: v.number(),
    totalCharged: v.number(),
    userWalletBefore: v.number(),
    userWalletAfter: v.number(),
    advisorEarning: v.number(),
    documents: v.optional(v.array(v.string())), // document IDs
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
    disconnectCount: v.optional(v.number()),
    lastActivityTime: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_advisorId", ["advisorId"])
    .index("by_status", ["status"]),

  // Transaction history - detailed record of all wallet changes
  transactions: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("add"),
      v.literal("deduct"),
      v.literal("refund"),
      v.literal("earning")
    ),
    amount: v.number(),
    balance: v.number(),
    sessionId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.object({ key: v.string(), value: v.any() })),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_sessionId", ["sessionId"]),

  // Advisor earnings history
  earnings: defineTable({
    advisorId: v.string(),
    sessionId: v.string(),
    amount: v.number(),
    durationSeconds: v.number(),
    userId: v.string(),
    userName: v.optional(v.string()),
    type: v.union(v.literal("chat"), v.literal("video")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("withdrawn")
    ),
    withdrawnAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_advisorId", ["advisorId"])
    .index("by_sessionId", ["sessionId"])
    .index("by_status", ["status"]),

  // Session documents
  documents: defineTable({
    sessionId: v.string(),
    uploadedBy: v.string(), // userId
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // Ratings and feedback
  ratings: defineTable({
    sessionId: v.string(),
    userName: v.optional(v.string()),
    userId: v.string(),
    advisorId: v.string(),
    type: v.optional(v.union(v.literal("chat"), v.literal("video"))),
    rating: v.number(), // 1-5
    feedback: v.string(),
    createdAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_advisorId", ["advisorId"]),

  // Session balance warnings log
  balanceWarnings: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    warningType: v.union(
      v.literal("2-minute"),
      v.literal("1-minute"),
      v.literal("zero-balance")
    ),
    remainingBalance: v.number(),
    createdAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"]),

  // Payout/Withdrawal requests
  payoutRequests: defineTable({
    advisorId: v.string(),
    amount: v.number(),
    method: v.union(
    v.literal("bank"),
    v.literal("stripe"),
    v.literal("paypal")
  ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    bankDetails: v.object({
      accountName: v.string(),
      accountNumber: v.string(),
      bankName: v.string(),
    }),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    reason: v.optional(v.string()),
  })
    .index("by_advisorId", ["advisorId"])
    .index("by_status", ["status"]),

  // Disputes
  disputes: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    advisorId: v.string(),
    reason: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    resolution: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_status", ["status"]),
});
