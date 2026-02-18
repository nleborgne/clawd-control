import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("in_progress"), v.literal("done"))),
  },
  handler: async (ctx, args) => {
    if (!args.status) {
      return await ctx.db.query("tasks").order("desc").take(200);
    }
    return await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", args.status!)).collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.union(
      v.literal("Revenue"),
      v.literal("Product"),
      v.literal("Community"),
      v.literal("Content"),
      v.literal("Operations"),
      v.literal("Clients"),
      v.literal("Trading"),
      v.literal("Brand"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    effort: v.union(v.literal("S"), v.literal("M"), v.literal("L")),
    reasoning: v.string(),
    nextAction: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("tasks", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    await ctx.db.insert("activities", {
      type: "task_created",
      message: `Task created: ${args.title}`,
      actor: "system",
      entityId: String(id),
      createdAt: Date.now(),
    });
    return id;
  },
});

export const setStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("in_progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: args.status });
    if (args.status === "done") {
      await ctx.db.insert("activities", {
        type: "task_completed",
        message: `Task completed: ${String(args.taskId)}`,
        actor: "system",
        entityId: String(args.taskId),
        createdAt: Date.now(),
      });
    }
  },
});
