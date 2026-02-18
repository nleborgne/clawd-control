import { ok, fail } from "@/lib/api";
import { readClients } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = await readClients();
    return ok({ clients });
  } catch {
    return fail("Failed to load clients");
  }
}
