import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    products: [
      {
        slug: "openclaw-core",
        name: "OpenClaw Core",
        status: "Active",
        health: "good",
        metrics: "99.9% uptime",
      },
      {
        slug: "signalforge",
        name: "SignalForge",
        status: "Development",
        health: "watch",
        metrics: "4 active streams",
      },
    ],
  });
}
