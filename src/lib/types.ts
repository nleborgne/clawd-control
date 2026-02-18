export type ServiceState = {
  name: string;
  status: "UP" | "DOWN";
  port: number;
  lastCheck: string;
};

export type AgentSummary = {
  id: string;
  name: string;
  role: string;
  model: string;
  level: "L1" | "L2" | "L3" | "L4";
  status: "healthy" | "unhealthy" | "idle";
  subAgents: string[];
};

export type CronJobState = {
  name: string;
  schedule: string;
  lastStatus: "success" | "error";
  consecutiveErrors: number;
  lastRun: string;
};

export type RevenueState = {
  currentRevenue: number;
  monthlyBurn: number;
  net: number;
};

export type ContentPipelineState = {
  draft: number;
  review: number;
  approved: number;
  published: number;
};

export type SuggestedTask = {
  id: string;
  category: "Revenue" | "Product" | "Community" | "Content" | "Operations" | "Clients" | "Trading" | "Brand";
  title: string;
  reasoning: string;
  nextAction: string;
  priority: "low" | "medium" | "high";
  effort: "S" | "M" | "L";
  status: "pending" | "approved" | "rejected";
};
