import { ok, fail } from "@/lib/api";
import { appendChatQueue } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sessionId?: string | null; content?: string; channel?: string };
    if (!body.content) {
      return fail("content is required", 400);
    }

    const payload = {
      id: crypto.randomUUID(),
      sessionId: body.sessionId ?? "web-ui",
      content: body.content,
      channel: body.channel ?? "webchat",
      createdAt: new Date().toISOString(),
    };

    await appendChatQueue(payload);
    return ok({ queued: true });
  } catch {
    return fail("Failed to queue message");
  }
}
