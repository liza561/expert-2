import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* -------------------------------------------------------------------------- */
/*                                   QUERIES                                  */
/* -------------------------------------------------------------------------- */

// Get user by Clerk userId
export const getUserByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get all users
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get all advisors
export const getAllAdvisors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "advisor"))
      .collect();
  },
});

// Search users
export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) return [];

    const normalized = searchTerm.toLowerCase().trim();
    const users = await ctx.db.query("users").collect();

    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(normalized) ||
          user.email.toLowerCase().includes(normalized)
      )
      .slice(0, 20);
  },
});

/* -------------------------------------------------------------------------- */
/*                                  MUTATIONS                                 */
/* -------------------------------------------------------------------------- */

// Create or update user (role is SYNCED FROM CLERK)
export const upsertUser = mutation({
  args: {
    userId: v.string(), // Clerk userId
    name: v.string(),
    email: v.string(),
    imageURL: v.string(),
    role: v.optional(v.union(
      v.literal("user"),
      v.literal("advisor"),
      v.literal("admin")
    )),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageURL: args.imageURL,
        role: args.role ?? existing.role, // ← mirrored from Clerk
        lastSeen: Date.now(),
      });

      return existing._id;
    }

    return  ctx.db.insert("users", {
      userId : args.userId,
      userName: args.name,
      name: args.name,
      email: args.email,
      imageURL: args.imageURL,
      role: args.role ?? "user",
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

// Update online / offline presence
export const setOnlineStatus = mutation({
  args: {
    userId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, { userId, isOnline }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) return null;

    await ctx.db.patch(user._id, {
      isOnline,
      lastSeen: Date.now(),
    });

    return true;
  },
});
