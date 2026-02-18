import { ok, fail } from "@/lib/api";
import { readAgentDetail, readAgentRegistry } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (id === "__none__") {
      return ok({
        agent: null,
        soul: "",
        rules: "",
        outputs: [],
      });
    }

    const agents = await readAgentRegistry();
    const agent = agents.find((item) => item.id === id);
    if (!agent) {
      return fail("Agent not found", 404);
    }

    const details = await readAgentDetail(id);
    return ok({
      agent,
      soul: details.soul,
      rules: details.rules,
      outputs: details.outputs,
    });
  } catch {
    return fail("Failed to load agent detail");
  }
}
