import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      ...args,
      status: "idle",
    });
    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      agentId,
      message: `Agent "${args.name}" (${args.role}) created`,
    });
    return agentId;
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      agentId: args.id,
      message: `Status changed to ${args.status}`,
    });
  },
});
