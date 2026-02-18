import { ok, fail } from "@/lib/api";
import { readRevenue } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await readRevenue());
  } catch {
    return fail("Failed to load revenue data");
  }
}
