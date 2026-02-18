"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

type BranchState = {
  branch: string;
  ahead: number;
  behind: number;
  dirty: boolean;
};

export function OpsView() {
  const tick = useAutoRefresh(15000);
  const system = useApi<{ services: Array<{ name: string; status: string; port: number }> }>("/api/system-state", [tick]);
  const branch = useApi<BranchState>("/api/system-state?includeBranch=1", [tick]);
  const observations = useApi<{ lines: string[] }>("/api/observations", [tick]);
  const priorities = useApi<{ lines: string[] }>("/api/priorities", [tick]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card className="space-y-3">
        <CardTitle>Server Health</CardTitle>
        <div className="space-y-2">
          {(system.data?.services ?? []).map((service) => (
            <div key={service.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] p-2 text-[11px]">
              <span>{service.name}</span>
              <span className={service.status === "UP" ? "text-emerald-300" : "text-red-300"}>{service.status}</span>
              <span className="text-zinc-500">:{service.port}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-3">
        <CardTitle>Branch Status</CardTitle>
        <CardDescription>
          {branch.data
            ? `${branch.data.branch} | ahead ${branch.data.ahead} | behind ${branch.data.behind} | ${branch.data.dirty ? "dirty" : "clean"}`
            : "No branch report."}
        </CardDescription>
      </Card>
      <Card className="space-y-3">
        <CardTitle>Observations Feed</CardTitle>
        <div className="space-y-1">
          {(observations.data?.lines ?? []).slice(0, 8).map((line, index) => (
            <p key={`${line}-${index}`} className="text-[11px] text-zinc-300">
              {line}
            </p>
          ))}
        </div>
      </Card>
      <Card className="space-y-3">
        <CardTitle>System Priorities</CardTitle>
        <div className="space-y-1">
          {(priorities.data?.lines ?? []).slice(0, 8).map((line, index) => (
            <p key={`${line}-${index}`} className="text-[11px] text-zinc-300">
              {line}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
