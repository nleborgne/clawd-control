"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type CommsItem = {
  id: string;
  source: string;
  summary: string;
  createdAt: string;
};

export function CommsView() {
  const { data } = useApi<{ items: CommsItem[] }>("/api/chat-history?mode=recent");

  return (
    <Card className="space-y-3">
      <CardTitle>Comms Digest</CardTitle>
      <div className="space-y-2">
        {(data?.items ?? []).map((item) => (
          <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{item.source}</div>
            <p className="text-[11px] text-zinc-200">{item.summary}</p>
            <CardDescription>{new Date(item.createdAt).toLocaleString()}</CardDescription>
          </div>
        ))}
      </div>
    </Card>
  );
}
