"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { VoiceInput } from "@/components/voice-input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  channel: "telegram" | "discord" | "webchat";
  content: string;
  createdAt: string;
};

type ChatSession = {
  sessionId: string;
  title: string;
  messageCount: number;
};

export function ChatCenterView() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const sessions = useApi<{ sessions: ChatSession[] }>("/api/chat-history?mode=sessions");
  const messages = useApi<{ messages: ChatMessage[] }>(sessionId ? `/api/chat-history?sessionId=${sessionId}` : "/api/chat-history");

  const grouped = useMemo(() => messages.data?.messages ?? [], [messages.data?.messages]);

  async function send() {
    if (!input.trim()) {
      return;
    }
    await fetch("/api/chat-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        content: input,
        channel: "webchat",
      }),
    });
    setInput("");
    window.location.reload();
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      <Card className="space-y-2 lg:col-span-1">
        <CardTitle>Sessions</CardTitle>
        <div className="space-y-1">
          {(sessions.data?.sessions ?? []).map((session) => (
            <button
              key={session.sessionId}
              type="button"
              onClick={() => setSessionId(session.sessionId)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-left"
            >
              <div className="text-[11px] text-zinc-200">{session.title}</div>
              <div className="text-[10px] text-zinc-500">{session.messageCount} messages</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="flex min-h-[420px] flex-col lg:col-span-3">
        <CardTitle>Chat Stream</CardTitle>
        <div className="mt-3 flex-1 space-y-2 overflow-auto">
          {grouped.map((message) => (
            <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-[11px]"
                    : "max-w-[80%] rounded-2xl rounded-bl-sm border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px]"
                }
              >
                <div className="mb-1 text-[9px] uppercase tracking-widest text-zinc-500">{message.channel}</div>
                <div>{message.content}</div>
              </div>
            </div>
          ))}
          {!grouped.length ? <p className="text-[11px] text-zinc-500">No messages in this session.</p> : null}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.08] pt-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-9 flex-1 rounded-xl border border-white/[0.09] bg-black/30 px-3 text-[11px]"
            placeholder="Send command to OpenClaw queue"
          />
          <VoiceInput onResult={setInput} />
          <Button variant="primary" onClick={send}>
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
