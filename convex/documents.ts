import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Upload document
export const uploadDocument = mutation({
  args: {
    sessionId: v.string(),
    uploadedBy: v.string(),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  handler: async (
    ctx,
    { sessionId, uploadedBy, fileName, fileUrl, fileSize, mimeType }
  ) => {
    const documentId = await ctx.db.insert("documents", {
      sessionId,
      uploadedBy,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      uploadedAt: Date.now(),
    });

    return documentId;
  },
});

// Get session documents
export const getSessionDocuments = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

// Get user's documents
export const getUserDocuments = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", userId))
      .collect();
  },
});

// Delete document
export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.db.delete(documentId);
    return { success: true };
  },
});
