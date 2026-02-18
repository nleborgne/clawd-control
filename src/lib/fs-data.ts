import fs from "node:fs/promises";
import path from "node:path";
import { readJsonSafe } from "@/lib/api";
import { safeJoinWorkspace } from "@/lib/workspace";
import type { AgentSummary, ContentPipelineState, CronJobState, RevenueState, ServiceState, SuggestedTask } from "@/lib/types";

async function readOptional(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function readSystemState() {
  const serverRaw = await readOptional(safeJoinWorkspace("state/servers.json"));
  const branchRaw = await readOptional(safeJoinWorkspace("state/branch-check.json"));
  const services = readJsonSafe<ServiceState[]>(serverRaw, [
    { name: "Convex", status: "UP", port: 3210, lastCheck: new Date().toISOString() },
    { name: "Telegram Bridge", status: "UP", port: 8082, lastCheck: new Date().toISOString() },
    { name: "Discord Relay", status: "DOWN", port: 8083, lastCheck: new Date().toISOString() },
  ]);
  const branch = readJsonSafe(branchRaw, {
    branch: "main",
    ahead: 0,
    behind: 0,
    dirty: false,
  });
  return {
    services,
    branch,
    uptime: "99.98%",
  };
}

export async function readAgentRegistry() {
  const registryRaw = await readOptional(safeJoinWorkspace("agents/registry.json"));
  const agents = readJsonSafe<AgentSummary[]>(registryRaw, [
    {
      id: "hephaestus",
      name: "Hephaestus",
      role: "Senior Staff Engineer",
      model: "gpt-5.3-codex",
      level: "L4",
      status: "healthy",
      subAgents: ["explore", "librarian", "oracle"],
    },
  ]);
  return agents;
}

export async function readAgentDetail(id: string) {
  const soul = await readOptional(safeJoinWorkspace(`agents/${id}/SOUL.md`));
  const rules = await readOptional(safeJoinWorkspace(`agents/${id}/RULES.md`));
  const outputsDir = safeJoinWorkspace("shared-context/agent-outputs");
  let outputs: string[] = [];
  try {
    const entries = await fs.readdir(outputsDir);
    const target = entries.filter((name) => name.includes(id)).slice(0, 10);
    outputs = await Promise.all(target.map((name) => readOptional(path.join(outputsDir, name))));
  } catch {
    outputs = [];
  }
  return {
    soul,
    rules,
    outputs,
  };
}

export async function readCronHealth() {
  const raw = await readOptional(safeJoinWorkspace("state/crons.json"));
  return readJsonSafe<{ jobs: CronJobState[] }>(raw, {
    jobs: [
      {
        name: "nightly-ops-sync",
        schedule: "*/15 * * * *",
        lastStatus: "success",
        consecutiveErrors: 0,
        lastRun: new Date().toISOString(),
      },
    ],
  });
}

export async function readRevenue() {
  const raw = await readOptional(safeJoinWorkspace("state/revenue.json"));
  return readJsonSafe<RevenueState>(raw, {
    currentRevenue: 112000,
    monthlyBurn: 37000,
    net: 75000,
  });
}

export async function readContentPipeline() {
  const raw = await readOptional(safeJoinWorkspace("content/queue.md"));
  const lines = raw.split("\n").map((line) => line.toLowerCase());
  const counts: ContentPipelineState = {
    draft: lines.filter((line) => line.includes("[draft]")).length,
    review: lines.filter((line) => line.includes("[review]")).length,
    approved: lines.filter((line) => line.includes("[approved]")).length,
    published: lines.filter((line) => line.includes("[published]")).length,
  };
  return counts;
}

export async function readSuggestedTasks() {
  const raw = await readOptional(safeJoinWorkspace("state/suggested-tasks.json"));
  return readJsonSafe<{ tasks: SuggestedTask[] }>(raw, {
    tasks: [
      {
        id: "st-1",
        category: "Operations",
        title: "Optimize cron retry policy",
        reasoning: "Consecutive errors climbed in nightly scrape jobs.",
        nextAction: "Apply exponential backoff with cap.",
        priority: "high",
        effort: "M",
        status: "pending",
      },
    ],
  });
}

export async function writeSuggestedTasks(payload: { tasks: SuggestedTask[] }) {
  const file = safeJoinWorkspace("state/suggested-tasks.json");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
}

export async function readMarkdownLines(relPath: string) {
  const raw = await readOptional(safeJoinWorkspace(relPath));
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function readChatHistory() {
  const transcriptsDir = safeJoinWorkspace("transcripts");
  try {
    const files = await fs.readdir(transcriptsDir);
    const jsonlFiles = files.filter((name) => name.endsWith(".jsonl"));
    const sessions = await Promise.all(
      jsonlFiles.map(async (fileName) => {
        const content = await readOptional(path.join(transcriptsDir, fileName));
        const messages = content
          .split("\n")
          .filter(Boolean)
          .map((line) => readJsonSafe<Record<string, unknown>>(line, {}));
        return {
          fileName,
          messages,
        };
      }),
    );
    return sessions;
  } catch {
    return [];
  }
}

export async function appendChatQueue(entry: object) {
  const queueFile = safeJoinWorkspace("state/chat-queue.jsonl");
  await fs.mkdir(path.dirname(queueFile), { recursive: true });
  await fs.appendFile(queueFile, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function readClients() {
  const clientsDir = safeJoinWorkspace("clients");
  try {
    const files = await fs.readdir(clientsDir);
    const md = files.filter((name) => name.endsWith(".md"));
    const clients = await Promise.all(
      md.map(async (name) => {
        const raw = await readOptional(path.join(clientsDir, name));
        const lines = raw.split("\n").map((line) => line.trim());
        const status = (lines.find((line) => line.startsWith("Status:"))?.replace("Status:", "").trim() ?? "Prospect") as
          | "Prospect"
          | "Contacted"
          | "Meeting"
          | "Proposal"
          | "Active";
        const contacts = lines
          .find((line) => line.startsWith("Contacts:"))
          ?.replace("Contacts:", "")
          .split(",")
          .map((item) => item.trim()) ?? ["unknown"];
        return {
          id: name.replace(/\.md$/, ""),
          name: lines.find((line) => line.startsWith("# "))?.replace("# ", "") ?? name.replace(/\.md$/, ""),
          status,
          contacts,
          lastInteraction: lines.find((line) => line.startsWith("Last:"))?.replace("Last:", "").trim() ?? "n/a",
          nextAction: lines.find((line) => line.startsWith("Next:"))?.replace("Next:", "").trim() ?? "Follow up",
        };
      }),
    );
    return clients;
  } catch {
    return [];
  }
}

export async function searchKnowledge(query: string) {
  const root = safeJoinWorkspace(".");
  const maxFiles = 120;
  const results: Array<{ path: string; excerpt: string }> = [];

  async function walk(dir: string): Promise<void> {
    if (results.length >= maxFiles) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= maxFiles) {
        break;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".git"].includes(entry.name)) {
          continue;
        }
        await walk(full);
        continue;
      }
      if (!/\.(md|json|txt|yaml|yml)$/i.test(entry.name)) {
        continue;
      }
      const content = await readOptional(full);
      const index = content.toLowerCase().indexOf(query.toLowerCase());
      if (index >= 0) {
        const excerpt = content.slice(Math.max(0, index - 70), index + 170).replace(/\s+/g, " ");
        results.push({ path: path.relative(root, full), excerpt });
      }
    }
  }

  await walk(root);
  return results.slice(0, 40);
}
