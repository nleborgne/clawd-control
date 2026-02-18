import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_completed"),
      v.literal("event_created"),
      v.literal("content_published"),
      v.literal("contact_added"),
      v.literal("system_observation"),
    ),
    message: v.string(),
    actor: v.string(),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_actor", ["actor"]),

  calendarEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.union(v.literal("ops"), v.literal("client"), v.literal("content"), v.literal("personal")),
    color: v.string(),
    createdBy: v.string(),
  })
    .index("by_start_time", ["startTime"])
    .index("by_type", ["type"]),

  tasks: defineTable({
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
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    effort: v.union(v.literal("S"), v.literal("M"), v.literal("L")),
    reasoning: v.string(),
    nextAction: v.string(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  contacts: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    status: v.union(v.literal("Prospect"), v.literal("Contacted"), v.literal("Meeting"), v.literal("Proposal"), v.literal("Active")),
    contacts: v.array(v.string()),
    lastInteraction: v.string(),
    nextAction: v.string(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_company", ["company"]),

  contentDrafts: defineTable({
    title: v.string(),
    platformTarget: v.string(),
    draftText: v.string(),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("approved"), v.literal("published")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_platform", ["platformTarget"]),

  ecosystemProducts: defineTable({
    slug: v.string(),
    name: v.string(),
    status: v.union(v.literal("Active"), v.literal("Development"), v.literal("Concept")),
    health: v.union(v.literal("good"), v.literal("watch"), v.literal("risk")),
    metrics: v.string(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
});
