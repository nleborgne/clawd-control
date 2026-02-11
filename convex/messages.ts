import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const send = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      attachments: args.attachments ?? [],
    });

    const task = await ctx.db.get(args.taskId);
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      message: `Comment on "${task?.title}"`,
      taskId: args.taskId,
    });

    // Notify other assignees on the task
    if (task) {
      for (const agentId of task.assigneeIds) {
        if (agentId !== args.fromAgentId) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: agentId,
            content: `New comment on "${task.title}"`,
            delivered: false,
            taskId: args.taskId,
          });
        }
      }
    }

    return messageId;
  },
});
