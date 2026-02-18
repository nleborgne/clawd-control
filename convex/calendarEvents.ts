import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listWeek = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_start_time", (q) => q.gte("startTime", args.from).lte("startTime", args.to))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.union(v.literal("ops"), v.literal("client"), v.literal("content"), v.literal("personal")),
    color: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("calendarEvents", args);
    await ctx.db.insert("activities", {
      type: "event_created",
      message: `Created event ${args.title}`,
      actor: args.createdBy,
      entityId: String(id),
      createdAt: Date.now(),
    });
    return id;
  },
});
