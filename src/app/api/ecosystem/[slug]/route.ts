import fs from "node:fs/promises";
import path from "node:path";
import { ok } from "@/lib/api";
import { safeJoinWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = safeJoinWorkspace(`ecosystem/${slug}`);
  const sections: Record<string, string> = {};

  const keys = ["overview", "brand", "community", "content", "legal", "product", "website", "actions"];

  await Promise.all(
    keys.map(async (key) => {
      try {
        sections[key] = await fs.readFile(path.join(base, `${key}.md`), "utf8");
      } catch {
        sections[key] = "No memory file available.";
      }
    }),
  );

  return ok({
    slug,
    name: slug
      .split("-")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" "),
    sections,
  });
}
