import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ecosystemProducts").order("desc").take(120);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("ecosystemProducts").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    status: v.union(v.literal("Active"), v.literal("Development"), v.literal("Concept")),
    health: v.union(v.literal("good"), v.literal("watch"), v.literal("risk")),
    metrics: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ecosystemProducts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
