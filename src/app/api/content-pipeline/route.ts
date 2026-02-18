import { ok, fail } from "@/lib/api";
import { readContentPipeline } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const counts = await readContentPipeline();

    if (url.searchParams.get("detailed") === "1") {
      const now = Date.now();
      const drafts = [
        {
          _id: "draft-1",
          title: "Macro update for AI agency operators",
          platformTarget: "Newsletter",
          draftText: "This week in autonomous agents...",
          status: "draft",
          createdAt: now - 1000 * 60 * 90,
        },
        {
          _id: "draft-2",
          title: "OpenClaw release notes",
          platformTarget: "X / Twitter",
          draftText: "We shipped better tool orchestration...",
          status: "review",
          createdAt: now - 1000 * 60 * 70,
        },
        {
          _id: "draft-3",
          title: "Discord community digest",
          platformTarget: "Discord",
          draftText: "Top threads from this week...",
          status: "approved",
          createdAt: now - 1000 * 60 * 20,
        },
        {
          _id: "draft-4",
          title: "Case study: autonomous ops stack",
          platformTarget: "LinkedIn",
          draftText: "How we reduced manual interventions by 42%...",
          status: "published",
          createdAt: now - 1000 * 60 * 10,
        },
      ] as const;
      return ok({ drafts });
    }

    return ok(counts);
  } catch {
    return fail("Failed to load content pipeline");
  }
}
