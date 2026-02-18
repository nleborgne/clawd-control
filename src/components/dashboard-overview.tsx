"use client";

import { motion } from "framer-motion";
import { Activity, BadgeCheck, Bot, CircleDollarSign, Clock3, Loader, Server } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useMounted } from "@/hooks/use-mounted";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { AgentSummary, ContentPipelineState, CronJobState, RevenueState, ServiceState } from "@/lib/types";

type AgentApi = {
  agents: AgentSummary[];
  activeCount: number;
  healthyRatio: string;
  activeSubAgentCount: number;
};

const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardOverview() {
  const mounted = useMounted();
  const tick = useAutoRefresh(15000);
  const system = useApi<{ services: ServiceState[]; uptime: string }>("/api/system-state", [tick]);
  const agents = useApi<AgentApi>("/api/agents", [tick]);
  const cron = useApi<{ jobs: CronJobState[] }>("/api/cron-health", [tick]);
  const revenue = useApi<RevenueState>("/api/revenue", [tick]);
  const content = useApi<ContentPipelineState>("/api/content-pipeline", [tick]);
  const health = useApi<{ pendingApprovals: number; activeSessions: number }>("/api/health", [tick]);

  const loading = [system, agents, cron, revenue, content, health].some((item) => item.isLoading && !item.data);

  const statusCards = [
    {
      title: "System Health",
      icon: Server,
      body:
        system.data?.services.map((service) => `${service.name} ${service.status} · ${service.port}`).join("\n") ?? "Awaiting telemetry",
      footer: system.data?.services.at(0) ? `Last check ${formatShortDate(system.data.services[0].lastCheck)}` : "No service data",
    },
    {
      title: "Agent Status",
      icon: Bot,
      body: agents.data
        ? `${agents.data.activeCount} active · ${agents.data.healthyRatio} healthy · ${agents.data.activeSubAgentCount} sub-agents`
        : "Waiting for agent registry",
      footer: agents.data ? `${agents.data.agents.length} registered agents` : "No agents found",
    },
    {
      title: "Cron Health",
      icon: Clock3,
      body: cron.data?.jobs.slice(0, 3).map((job) => `${job.name} ${job.lastStatus}`).join("\n") ?? "No cron entries",
      footer: cron.data ? `${cron.data.jobs.length} jobs monitored` : "No job metadata",
    },
    {
      title: "Revenue Tracker",
      icon: CircleDollarSign,
      body: revenue.data
        ? `${formatCurrency(revenue.data.currentRevenue)} revenue\n${formatCurrency(revenue.data.monthlyBurn)} burn\n${formatCurrency(revenue.data.net)} net`
        : "Revenue feed not ready",
      footer: "Updated from workspace state",
    },
    {
      title: "Content Pipeline",
      icon: Activity,
      body: content.data
        ? `Draft ${content.data.draft} · Review ${content.data.review}\nApproved ${content.data.approved} · Published ${content.data.published}`
        : "Pipeline queue unavailable",
      footer: "Synced from queue markers",
    },
    {
      title: "Quick Stats",
      icon: BadgeCheck,
      body: `Pending approvals ${health.data?.pendingApprovals ?? 0}\nActive sessions ${health.data?.activeSessions ?? 0}`,
      footer: `Uptime ${system.data?.uptime ?? "--"}`,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Mission Control</h1>
          <p className="text-[10px] text-zinc-500">Global operations view across filesystem and Convex streams.</p>
        </div>
        <Badge tone="primary" className="gap-1">
          <Loader className="h-3 w-3" /> AUTO 15S
        </Badge>
      </div>
      <motion.div
        className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        initial={false}
        animate={mounted ? "visible" : undefined}
        variants={containerVariants}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[170px]" />)
          : statusCards.map((card) => (
              <motion.div
                key={card.title}
                initial={mounted ? "hidden" : false}
                animate={mounted ? "visible" : undefined}
                variants={cardVariants}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                whileHover={{ y: -3 }}
              >
                <Card className="h-full space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-200">{card.body}</pre>
                  <CardDescription>{card.footer}</CardDescription>
                </Card>
              </motion.div>
            ))}
      </motion.div>
    </section>
  );
}
