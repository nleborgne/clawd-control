import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("approved"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    if (!args.status) {
      return await ctx.db.query("contentDrafts").order("desc").take(200);
    }
    return await ctx.db.query("contentDrafts").withIndex("by_status", (q) => q.eq("status", args.status!)).collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    platformTarget: v.string(),
    draftText: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentDrafts", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    draftId: v.id("contentDrafts"),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("approved"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, { status: args.status });
    if (args.status === "published") {
      await ctx.db.insert("activities", {
        type: "content_published",
        message: `Draft published: ${String(args.draftId)}`,
        actor: "system",
        entityId: String(args.draftId),
        createdAt: Date.now(),
      });
    }
  },
});
