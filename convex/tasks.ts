import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Simple create from UI (no agent context)
export const createFromUI = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    const assigneeIds = args.assigneeIds ?? [];
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description ?? "",
      status: assigneeIds.length > 0 ? "assigned" : "inbox",
      assigneeIds,
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    creatorAgentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const assigneeIds = args.assigneeIds ?? [];
    const status = assigneeIds.length > 0 ? "assigned" : "inbox";

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status,
      assigneeIds,
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.creatorAgentId,
      message: `Task "${args.title}" created`,
      taskId,
    });

    // Notify assignees
    for (const agentId of assigneeIds) {
      await ctx.db.insert("notifications", {
        mentionedAgentId: agentId,
        content: `You've been assigned to: "${args.title}"`,
        delivered: false,
        taskId,
      });
    }

    return taskId;
  },
});

export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assigneeIds: v.array(v.id("agents")),
    byAgentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assigneeIds: args.assigneeIds,
      status: "assigned",
    });
    const task = await ctx.db.get(args.id);

    await ctx.db.insert("activities", {
      type: "task_assigned",
      agentId: args.byAgentId,
      message: `Task "${task?.title}" assigned`,
      taskId: args.id,
    });

    for (const agentId of args.assigneeIds) {
      await ctx.db.insert("notifications", {
        mentionedAgentId: agentId,
        content: `You've been assigned to: "${task?.title}"`,
        delivered: false,
        taskId: args.id,
      });
    }
  },
});

// Simple status move (from UI, no agent context)
export const moveStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    byAgentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    const task = await ctx.db.get(args.id);

    await ctx.db.insert("activities", {
      type: "task_status_changed",
      agentId: args.byAgentId,
      message: `Task "${task?.title}" moved to ${args.status}`,
      taskId: args.id,
    });
  },
});
