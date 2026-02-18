"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";

type KnowledgeResult = {
  path: string;
  excerpt: string;
};

export function KnowledgeBase() {
  const [query, setQuery] = useState("agent");
  const { data } = useApi<{ results: KnowledgeResult[] }>(`/api/knowledge?q=${encodeURIComponent(query)}`, [query]);

  return (
    <Card className="space-y-3">
      <CardTitle>Knowledge Search</CardTitle>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 flex-1 rounded-xl border border-white/[0.09] bg-black/30 px-3 text-[11px]"
          placeholder="Search workspace memory"
        />
        <Button variant="ghost">Live</Button>
      </div>
      <div className="space-y-2">
        {(data?.results ?? []).map((result) => (
          <div key={result.path} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
            <div className="text-[10px] text-zinc-500">{result.path}</div>
            <CardDescription>{result.excerpt}</CardDescription>
          </div>
        ))}
      </div>
    </Card>
  );
}
