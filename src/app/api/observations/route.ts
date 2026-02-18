import { ok, fail } from "@/lib/api";
import { readMarkdownLines } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lines = await readMarkdownLines("state/observations.md");
    return ok({ lines });
  } catch {
    return fail("Failed to load observations");
  }
}
