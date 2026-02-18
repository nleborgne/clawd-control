import { ok, fail } from "@/lib/api";
import { readAgentRegistry } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await readAgentRegistry();
    const healthy = agents.filter((agent) => agent.status === "healthy").length;
    const activeCount = agents.filter((agent) => agent.status !== "idle").length;
    const activeSubAgentCount = agents.reduce((count, agent) => count + agent.subAgents.length, 0);

    return ok({
      agents,
      activeCount,
      healthyRatio: agents.length ? `${healthy}/${agents.length}` : "0/0",
      activeSubAgentCount,
    });
  } catch {
    return fail("Failed to load agents");
  }
}
