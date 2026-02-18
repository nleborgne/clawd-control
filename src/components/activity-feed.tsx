"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: number;
};

export function ActivityFeed() {
  const tick = useAutoRefresh(15000);
  const { data } = useApi<{ items: ActivityItem[] }>("/api/health", [tick]);

  return (
    <Card className="space-y-3">
      <CardTitle>Live Activity</CardTitle>
      <div className="space-y-2">
        {(data?.items ?? []).slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
            <div className="text-[10px] text-zinc-500">{item.type}</div>
            <div className="text-[11px] text-zinc-200">{item.message}</div>
          </div>
        ))}
        {!data?.items?.length ? <div className="text-[10px] text-zinc-500">No current activity.</div> : null}
      </div>
    </Card>
  );
}
