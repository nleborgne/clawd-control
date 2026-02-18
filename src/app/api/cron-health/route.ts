import { ok, fail } from "@/lib/api";
import { readCronHealth } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await readCronHealth();
    return ok(payload);
  } catch {
    return fail("Failed to load cron health");
  }
}
