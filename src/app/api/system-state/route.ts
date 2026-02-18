import { ok, fail } from "@/lib/api";
import { readSystemState } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const state = await readSystemState();
    const url = new URL(request.url);
    if (url.searchParams.get("includeBranch") === "1") {
      return ok(state.branch);
    }
    return ok({ services: state.services, uptime: state.uptime });
  } catch {
    return fail("Failed to load system state");
  }
}
