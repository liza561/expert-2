import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by Clerk ID
export const getUserByClerkUserId = query({
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

// Create or update user
export const upsertUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    imageURL: v.string(),
  },
  handler: async (ctx, { userId, name, email, imageURL }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name,
        email,
        imageURL,
        lastSeen: Date.now(),
      });

      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      userId,
      name,
      email,
      imageURL,
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

// Search users
export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) return [];

    const normalized = searchTerm.toLowerCase().trim();
    const allUsers = await ctx.db.query("users").collect();

    return allUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(normalized) ||
          user.email.toLowerCase().includes(normalized)
      )
      .slice(0, 20);
  },
});

// Update presence (online/offline)
export const setOnlineStatus = mutation({
  args: { userId: v.string(), isOnline: v.boolean() },
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
