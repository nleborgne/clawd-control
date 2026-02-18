import os from "node:os";
import { ok, fail } from "@/lib/api";

type EventItem = {
  _id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: string;
  color: string;
};

const runtimeEvents: EventItem[] = [];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const scope = new URL(request.url).searchParams.get("scope");
    if (scope === "calendar") {
      return ok({ events: runtimeEvents });
    }

    return ok({
      status: "ok",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      host: os.hostname(),
      convexConnected: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
      pendingApprovals: 3,
      activeSessions: 7,
      totalTasks: 41,
      items: [
        {
          id: "act-1",
          type: "subagent_spawn",
          message: "spawned explorer for pipeline reconciliation",
          createdAt: Date.now(),
        },
        {
          id: "act-2",
          type: "cron",
          message: "content dispatch finished with 0 retries",
          createdAt: Date.now(),
        },
      ],
      events: runtimeEvents,
    });
  } catch {
    return fail("Health endpoint failed");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: string; title?: string };
    if (body.kind === "calendarEvent" && body.title) {
      const now = Date.now();
      runtimeEvents.unshift({
        _id: crypto.randomUUID(),
        title: body.title,
        startTime: now,
        endTime: now + 1000 * 60 * 30,
        type: "manual",
        color: "#93c5fd",
      });
      return ok({ events: runtimeEvents });
    }
    return fail("Unsupported request", 400);
  } catch {
    return fail("Failed to update health state");
  }
}
