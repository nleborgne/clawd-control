"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import type { AgentSummary } from "@/lib/types";

type AgentDetail = {
  agent: AgentSummary;
  soul: string;
  rules: string;
  outputs: string[];
};

export function AgentsView() {
  const mounted = useMounted();
  const { data } = useApi<{ agents: AgentSummary[] }>("/api/agents");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useApi<AgentDetail>(selectedId ? `/api/agents/${selectedId}` : "/api/agents/__none__", [selectedId]);

  const selected = useMemo(() => data?.agents.find((agent) => agent.id === selectedId) ?? null, [data?.agents, selectedId]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:col-span-2">
        {(data?.agents ?? []).map((agent, index) => (
          <motion.button
            key={agent.id}
            type="button"
            className="text-left"
            initial={mounted ? { opacity: 0, y: 10 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedId(agent.id)}
          >
            <Card className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{agent.name}</CardTitle>
                <Badge tone={agent.status === "healthy" ? "success" : agent.status === "unhealthy" ? "danger" : "neutral"}>{agent.status}</Badge>
              </div>
              <CardDescription>
                {agent.role} · {agent.model} · {agent.level}
              </CardDescription>
            </Card>
          </motion.button>
        ))}
      </div>
      <Card className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
        <CardTitle>{selected ? `${selected.name} detail` : "Select an agent"}</CardTitle>
        {detail.data ? (
          <>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">SOUL</div>
              <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-[11px] text-zinc-300">{detail.data.soul}</pre>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">RULES</div>
              <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-[11px] text-zinc-300">{detail.data.rules}</pre>
            </div>
          </>
        ) : (
          <CardDescription>Open any card to inspect personality, rules, and output feed.</CardDescription>
        )}
      </Card>
    </div>
  );
}
