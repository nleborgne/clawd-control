import { ok, fail } from "@/lib/api";
import { readChatHistory } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function coerceMessage(item: Record<string, unknown>, idx: number) {
  const role = item.role === "assistant" ? "assistant" : "user";
  const channel = item.channel === "telegram" || item.channel === "discord" ? item.channel : "webchat";

  return {
    id: String(item.id ?? `message-${idx}`),
    role,
    channel,
    content: String(item.content ?? ""),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  };
}

export async function GET(request: Request) {
  try {
    const sessions = await readChatHistory();
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const sessionId = url.searchParams.get("sessionId");

    if (mode === "sessions") {
      return ok({
        sessions: sessions.map((session) => ({
          sessionId: session.fileName.replace(/\.jsonl$/, ""),
          title: session.fileName.replace(/\.jsonl$/, "").replace(/_/g, " "),
          messageCount: session.messages.length,
        })),
      });
    }

    if (mode === "recent") {
      const items = sessions
        .flatMap((session) => session.messages)
        .slice(-20)
        .map((message, index) => ({
          id: String(message.id ?? index),
          source: String(message.channel ?? "webchat"),
          summary: String(message.content ?? ""),
          createdAt: String(message.createdAt ?? new Date().toISOString()),
        }));
      return ok({ items });
    }

    const target = sessionId
      ? sessions.find((session) => session.fileName.replace(/\.jsonl$/, "") === sessionId)
      : sessions.at(-1);

    const messages = (target?.messages ?? []).map((item, index) => coerceMessage(item, index));
    return ok({ messages });
  } catch {
    return fail("Failed to load chat history");
  }
}
