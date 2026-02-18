import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("activities").take(1);
    if (existing.length > 0) {
      return { seeded: false, reason: "already-seeded" };
    }

    await ctx.db.insert("ecosystemProducts", {
      slug: "openclaw-core",
      name: "OpenClaw Core",
      status: "Active",
      health: "good",
      metrics: "312 active sessions",
      createdAt: Date.now(),
    });

    await ctx.db.insert("contentDrafts", {
      title: "Weekly Operations Digest",
      platformTarget: "Discord",
      draftText: "Top operational events from the week...",
      status: "review",
      createdAt: Date.now(),
    });

    await ctx.db.insert("tasks", {
      title: "Finalize mission control launch checklist",
      category: "Operations",
      status: "pending",
      priority: "high",
      effort: "M",
      reasoning: "Need validated handoff before 24/7 run mode.",
      nextAction: "Run dry-run and incident simulation.",
      createdAt: Date.now(),
    });

    await ctx.db.insert("contacts", {
      name: "Atlas Ventures",
      company: "Atlas",
      status: "Proposal",
      contacts: ["ops@atlas.dev"],
      lastInteraction: "2026-02-17",
      nextAction: "Send revised proposal deck",
      createdAt: Date.now(),
    });

    await ctx.db.insert("calendarEvents", {
      title: "Ops Reliability Standup",
      description: "Daily 15-min reliability sync",
      startTime: Date.now() + 1000 * 60 * 60,
      endTime: Date.now() + 1000 * 60 * 75,
      type: "ops",
      color: "#93c5fd",
      createdBy: "system",
    });

    await ctx.db.insert("activities", {
      type: "system_observation",
      actor: "seed",
      message: "Convex seed dataset created",
      createdAt: Date.now(),
    });

    return { seeded: true };
  },
});
