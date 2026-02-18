"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import type { SuggestedTask } from "@/lib/types";

const emojis: Record<SuggestedTask["category"], string> = {
  Revenue: "💸",
  Product: "🛠",
  Community: "🌐",
  Content: "✍️",
  Operations: "🛰",
  Clients: "🤝",
  Trading: "📈",
  Brand: "🎯",
};

export function SuggestedTasksView() {
  const { data } = useApi<{ tasks: SuggestedTask[] }>("/api/suggested-tasks");
  const [statusFilter, setStatusFilter] = useState<"all" | SuggestedTask["status"]>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | SuggestedTask["category"]>("all");

  async function updateTask(taskId: string, status: SuggestedTask["status"]) {
    await fetch("/api/suggested-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    window.location.reload();
  }

  const visibleTasks = useMemo(() => {
    return (data?.tasks ?? []).filter((task) => {
      const statusPass = statusFilter === "all" || task.status === statusFilter;
      const categoryPass = categoryFilter === "all" || task.category === categoryFilter;
      return statusPass && categoryPass;
    });
  }, [data?.tasks, statusFilter, categoryFilter]);

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | SuggestedTask["status"])}
          className="rounded-xl border border-white/[0.09] bg-black/30 px-2 py-1 text-[11px]"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as "all" | SuggestedTask["category"])}
          className="rounded-xl border border-white/[0.09] bg-black/30 px-2 py-1 text-[11px]"
        >
          <option value="all">All category</option>
          {Object.keys(emojis).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleTasks.map((task) => (
          <Card key={task.id} className="space-y-2">
            <CardTitle>
              {emojis[task.category]} {task.title}
            </CardTitle>
            <CardDescription>{task.reasoning}</CardDescription>
            <div className="text-[11px] text-zinc-300">Next: {task.nextAction}</div>
            <div className="text-[10px] text-zinc-500">
              Priority {task.priority.toUpperCase()} · Effort {task.effort}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => updateTask(task.id, "approved")}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => updateTask(task.id, "rejected")}>
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!visibleTasks.length ? <Card className="text-[11px] text-zinc-500">No suggested tasks match current filters.</Card> : null}
    </div>
  );
}
