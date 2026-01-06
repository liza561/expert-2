import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get advisor profile
export const getAdvisorProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get all advisor profiles (for client browsing)
export const getAllAdvisorProfiles = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("advisorProfiles").collect();
    return profiles.map((profile) => ({
      ...profile,
      // Include average rating
    }));
  },
});

// Search advisors by specialization
export const searchAdvisors = query({
  args: { specialization: v.string() },
  handler: async (ctx, { specialization }) => {
    const profiles = await ctx.db.query("advisorProfiles").collect();
    return profiles.filter((profile) =>
      profile.specialization.some(
        (spec) =>
          spec.toLowerCase().includes(specialization.toLowerCase())
      )
    );
  },
});

// Create or update advisor profile
export const upsertAdvisorProfile = mutation({
  args: {
    userId: v.string(),
    bio: v.string(),
    specialization: v.array(v.string()),

    chatPricePerMinute: v.number(),
    videoPricePerMinute: v.number(),

    availabilityHours: v.object({
      startTime: v.string(),
      endTime: v.string(),
      daysOfWeek: v.array(v.string()),
    }),
  },
  handler: async (
    ctx,
    {
      userId,
      bio,
      specialization,
      chatPricePerMinute,
      videoPricePerMinute,
      availabilityHours,
    }
  ) => {
    const existing = await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    const profileCompletion = calculateProfileCompletion({
      bio,
      specialization,
      chatPricePerMinute,
      videoPricePerMinute,
      availabilityHours,
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        bio,
        specialization,
        chatPricePerMinute,
        videoPricePerMinute,
        availabilityHours,
        profileCompletion,
        updatedAt: now,
      });
      
      return existing._id;
    }

    return await ctx.db.insert("advisorProfiles", {
      userId,
      bio,
      specialization,
      chatPricePerMinute,
      videoPricePerMinute,
      availabilityHours,
      profileCompletion,
      averageRating: 0,
      totalRatings: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update pricing
export const updateAdvisorPricing = mutation({
  args: {
    userId: v.string(),
    chatPricePerMinute: v.number(),
    videoPricePerMinute: v.number(),
  },
  handler: async (ctx, { userId, chatPricePerMinute, videoPricePerMinute }) => {
    const profile = await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Advisor profile not found");
    }

    await ctx.db.patch(profile._id, {
      chatPricePerMinute,
      videoPricePerMinute,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

// Update availability hours
export const updateAvailability = mutation({
  args: {
    userId: v.string(),
    availabilityHours: v.object({
      startTime: v.string(),
      endTime: v.string(),
      daysOfWeek: v.array(v.string()),
    }),
  },
  handler: async (ctx, { userId, availabilityHours }) => {
    const profile = await ctx.db
      .query("advisorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Advisor profile not found");
    }

    await ctx.db.patch(profile._id, {
      availabilityHours,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

function calculateProfileCompletion(profile: {
  bio: string;
  specialization: string[];
  chatPricePerMinute: number;
  videoPricePerMinute: number;
  availabilityHours: { startTime: string; endTime: string; daysOfWeek: string[] };
}): number {
  let completion = 0;
  if (profile.bio && profile.bio.length > 20) completion += 20;
  if (profile.specialization && profile.specialization.length > 0) completion += 20;
  if (profile.chatPricePerMinute > 0) completion += 20;
  if (profile.videoPricePerMinute > 0) completion += 20;
  if (
    profile.availabilityHours &&
    profile.availabilityHours.daysOfWeek.length > 0
  )
    completion += 20;
  return Math.min(completion, 100);
}
