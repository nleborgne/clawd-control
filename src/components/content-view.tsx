"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type Draft = {
  _id: string;
  title: string;
  platformTarget: string;
  draftText: string;
  status: "draft" | "review" | "approved" | "published";
  createdAt: number;
};

const columns: Array<Draft["status"]> = ["draft", "review", "approved", "published"];

export function ContentView() {
  const drafts = useApi<{ drafts: Draft[] }>("/api/content-pipeline?detailed=1");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((status) => (
        <Card key={status} className="space-y-2">
          <CardTitle>{status.toUpperCase()}</CardTitle>
          <div className="space-y-2">
            {(drafts.data?.drafts ?? [])
              .filter((draft) => draft.status === status)
              .map((draft) => (
                <div key={draft._id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
                  <p className="text-[11px] text-zinc-200">{draft.title}</p>
                  <CardDescription>{draft.platformTarget}</CardDescription>
                </div>
              ))}
            {(drafts.data?.drafts ?? []).filter((draft) => draft.status === status).length === 0 ? (
              <CardDescription>Nothing queued.</CardDescription>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
