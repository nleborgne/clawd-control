import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    status: v.union(v.literal("Prospect"), v.literal("Contacted"), v.literal("Meeting"), v.literal("Proposal"), v.literal("Active")),
    contacts: v.array(v.string()),
    lastInteraction: v.string(),
    nextAction: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      ...args,
      createdAt: Date.now(),
    });
    await ctx.db.insert("activities", {
      type: "contact_added",
      message: `Contact added: ${args.name}`,
      actor: "system",
      entityId: String(id),
      createdAt: Date.now(),
    });
    return id;
  },
});
