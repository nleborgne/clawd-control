import { ok, fail } from "@/lib/api";
import { searchKnowledge } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    if (!query.trim()) {
      return ok({ results: [] });
    }
    const results = await searchKnowledge(query);
    return ok({ results });
  } catch {
    return fail("Failed to search knowledge");
  }
}
