import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    commits: [
      { hash: "a1b2c3", message: "Refactor agent scheduler", author: "OpenClaw", date: new Date().toISOString() },
      { hash: "d4e5f6", message: "Tune mission dashboard cards", author: "OpenClaw", date: new Date().toISOString() },
    ],
    fileTree: ["src/app/page.tsx", "src/components/nav.tsx", "convex/schema.ts"],
    pullRequests: [],
  });
}
